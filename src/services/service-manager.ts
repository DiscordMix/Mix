import Bot from "../core/bot";
import Service, {IRawProcessMsg, ProcessMsgType, IProcessMsg, ForkedService} from "./service";
import {Log, Utils} from "..";
import {spawn, fork, ChildProcess} from "child_process";
import fs from "fs";
import path from "path";
import {resolve} from "bluebird";

export type IServiceMap = Map<string, Service>;
export type IReadonlyServiceMap = ReadonlyMap<string, Service>;

export default class ServiceManager {
    public static heartbeatTimeout: number = 6000;

    private readonly bot: Bot;
    private readonly services: IServiceMap;
    private readonly forkedServices: Map<string, ChildProcess>;
    private readonly forkHeartbeats: Map<string, NodeJS.Timeout>;

    /**
     * @param {Bot} bot
     */
    public constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {IServiceMap}
         * @private
         * @readonly
         */
        this.services = new Map();

        /**
         * @type {Map<string, Service>}
         * @private
         * @readonly
         */
        this.forkedServices = new Map();

        /**
         * @type {Map<string, NodeJS.Timeout>}
         * @private
         * @readonly
         */
        this.forkHeartbeats = new Map();
    }

    public isForked(name: string): boolean {
        return this.forkedServices.has(name);
    }

    public getFork(name: string): ChildProcess | null {
        return this.forkedServices.get(name) || null;
    }

    /**
     * @param {Service} service
     * @return {boolean}
     */
    public register(service: Service): boolean {
        if (!service || typeof service !== "object" || Array.isArray(service)) {
            return false;
        }
        else if (!this.services.has(service.meta.name)) {
            this.services.set(service.meta.name, service);

            return true;
        }

        return false;
    }

    /**
     * @param {Service[]} multipleServices
     * @return {number}
     */
    public registerMultiple(multipleServices: Service[]): number {
        let registered: number = 0;

        for (let i: number = 0; i < multipleServices.length; i++) {
            if (this.register(multipleServices[i])) {
                registered++;
            }
        }

        return registered + 1;
    }

    /**
     * @param {string} name
     * @return {Promise<boolean>} Whether the service was started
     */
    public async enable(name: string): Promise<boolean> {
        if (typeof name !== "string" || Utils.isEmpty(name) || Array.isArray(name)) {
            return false;
        }

        const service: Service | null = this.services.get(name) || null;

        if (typeof service !== "object") {
            Log.warn(`[ServiceManager.enable] Failed to enable service '${name}' because it is not an object`);
        }
        else if (service !== null) {
            if (typeof service.canStart === "boolean") {
                if (!service.canStart) {
                    return false;
                }
            }
            else if (typeof service.canStart === "function") {
                if (!(await service.canStart())) {
                    return false;
                }
            }
            else {
                Log.error(`[ServiceManager.enable] Unexpected type of canEnable service property, expecting either a boolean or function for service '${name}'`);

                return false;
            }

            if (!service.fork) {
                await service.start();
            }
            else {
                if (!this.ignite(service.meta.name)) {
                    Log.warn(`[ServiceManager.enable] Failed to ignite forked service '${name}'`);
                }
            }

            return true;
        }
        else if (service === null) {
            Log.warn(`[ServiceManager.enable] Attempted to enable an unregistered service '${name}'`);
        }
        else {
            Log.warn(`[ServiceManager.enable] Unexpected composition of service '${name}'. (Your service may be invalid)`);
        }

        return false;
    }

    /**
     * Enable all services
     * @return {Promise<number>} The amount of successfully enabled services
     */
    public async enableAll(): Promise<number> {
        let enabled: number = 0;

        for (let [name, service] of this.services) {
            if (await this.enable(name)) {
                enabled++;
            }
        }

        return enabled;
    }

    private heartbeatFork(name: string): boolean {
        if (!this.forkedServices.has(name)) {
            return false;
        }

        const child: ChildProcess = this.forkedServices.get(name) as ChildProcess;
        
        if (this.forkHeartbeats.has(name)) {
            clearTimeout(this.forkHeartbeats.get(name) as NodeJS.Timeout);
        }

        // TODO: Auto-restart on timeout
        this.forkHeartbeats.set(name, setTimeout(() => {
            if (!child.killed) {
                child.kill("timeout");
            }

            this.forkHeartbeats.delete(name);
            this.forkHeartbeats.delete(name);
            Log.warn(`[ServiceManager.heartbeatFork] Forked service '${name}' timed out`);
        }, ServiceManager.heartbeatTimeout));

        return true;
    }

    public ignite(name: string): boolean {
        const absPath: string = path.resolve(path.join(this.bot.settings.paths.services, `${name}.js`));

        if (!fs.existsSync(absPath)) {
            return false;
        }

        const child: ChildProcess = fork(path.join(__dirname, "service-igniter.js"), [absPath]);

        child.on("message", (rawMsg: IRawProcessMsg, sender: any) => {
            const msg: IProcessMsg = {
                type: rawMsg._t,
                data: rawMsg._d
            };

            switch (msg.type) {
                case ProcessMsgType.Heartbeat: {
                    this.heartbeatFork(name);

                    break;
                }

                default: {
                    Log.warn(`[ServiceManager.ignite:message] Ignoring invalid message type ${msg.type} from '${name}'`);
                }
            }
        });

        /* child.send({
            _d: undefined,
            _t: ProcessMsgType.Heartbeat
        } as IRawProcessMsg); */

        this.heartbeatFork(name);
        Log.debug(`[ServiceManager.ignite] Spawned service '${name}' @ ${child.pid}`);

        return true;
    }

    public async stopFork(name: string): Promise<boolean> {
        if (!this.forkedServices.has(name)) {
            return false;
        }

        const child: ChildProcess = this.forkedServices.get(name) as ChildProcess;

        return new Promise<boolean>((resolve) => {
            child.send({
                _t: ProcessMsgType.Stop
            }, (error: Error) => {
                if (error) {
                    throw error;
                }

                resolve(true);
            });
        });
    }

    public async stopAllForks(): Promise<number> {
        let stopped: number = 0;

        for (let [name, child] of this.forkedServices) {
            if (await this.stopFork(name)) {
                stopped++;
            }
        }

        return stopped;
    }

    /**
     * @param {string} name
     * @return {Readonly<Service> | null}
     */
    public getService(name: string): Readonly<Service> | null {
        if (typeof name !== "string" || Utils.isEmpty(name) || Array.isArray(name)) {
            return null;
        }

        return this.services.get(name) || null;
    }

    /**
     * Dispose all services
     */
    public async disposeAll(): Promise<void> {
        for (let [name, service] of this.services) {
            await service.dispose();
        }
    }

    /**
     * @return {IReadonlyServiceMap}
     */
    public getAll(): IReadonlyServiceMap {
        return this.services as IReadonlyServiceMap;
    }

    public contains(name: string): boolean {
        if (typeof name !== "string" || Utils.isEmpty(name)) {
            return false;
        }

        return this.services.has(name);
    }
}
