import {ChildProcess, fork} from "child_process";
import {EventEmitter} from "events";
import fs from "fs";
import path from "path";
import Bot from "../core/bot";
import Log from "../core/log";
import Util from "../core/util";
import {IGenericService, IProcessMsg, IRawProcessMsg, ProcessMsgType} from "./generic-service";
import SMIS from "./smis";
import {PromiseOr} from "@atlas/xlib";

export type ServiceMap = Map<string, IGenericService>;
export type ReadonlyServiceMap = ReadonlyMap<string, IGenericService>;

export interface IServiceManager extends EventEmitter {
    readonly size: number;

    isForked(name: string): boolean;
    getFork(name: string): ChildProcess | null;
    register(service: IGenericService): boolean;
    registerMultiple(multipleServices: IGenericService[]): number;
    start(name: string): PromiseOr<boolean>;
    startAll(): PromiseOr<number>;
    ignite(name: string): boolean;
    stopFork(name: string): PromiseOr<boolean>;
    stopAllForks(): PromiseOr<number>;
    getService(name: string): Readonly<IGenericService> | null;
    disposeAll(): PromiseOr<void>;
    getAll(): ReadonlyServiceMap;
    stopAll(): PromiseOr<this>;
    contains(name: string): boolean;
}

// TODO: Emit events through bot instead.
/**
 * Manages service states.
 */
export default class ServiceManager extends EventEmitter implements IServiceManager {
    public static heartbeatTimeout: number = 6000;

    protected readonly bot: Bot;
    protected readonly services: ServiceMap;
    protected readonly forkedServices: Map<string, ChildProcess>;
    protected readonly forkHeartbeats: Map<string, NodeJS.Timeout>;

    /**
     * @param {Bot} bot
     */
    public constructor(bot: Bot) {
        super();

        /**
         * @type {Bot}
         * @protected
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {ServiceMap}
         * @protected
         * @readonly
         */
        this.services = new Map();

        /**
         * @type {Map<string, Service>}
         * @protected
         * @readonly
         */
        this.forkedServices = new Map();

        /**
         * @type {Map<string, NodeJS.Timeout>}
         * @protected
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
     * @param {GenericService} service
     * @return {boolean}
     */
    public register(service: IGenericService): boolean {
        if (!service || typeof service !== "object" || Array.isArray(service)) {
            return false;
        }
        else if (!this.services.has(service.meta.name)) {
            this.services.set(service.meta.name, service);
            this.emit("register", service.meta.name);

            return true;
        }

        return false;
    }

    /**
     * @param {GenericService[]} multipleServices
     * @return {number}
     */
    public registerMultiple(multipleServices: IGenericService[]): number {
        let registered: number = 0;

        for (const service of multipleServices) {
            if (this.register(service)) {
                registered++;
            }
        }

        return registered + 1;
    }

    /**
     * @param {string} name
     * @return {Promise<boolean>} Whether the service was started
     */
    public async start(name: string): Promise<boolean> {
        if (typeof name !== "string" || Util.isEmpty(name) || Array.isArray(name)) {
            return false;
        }

        const service: IGenericService | null = this.services.get(name) || null;

        if (typeof service !== "object") {
            Log.warn(`Failed to enable service '${name}' because it is not an object`);
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
                throw Log.error(`Unexpected type of canEnable service property, expecting either a boolean or function for service '${name}'`);
            }

            if (!service.fork) {
                await service.start();
            }
            else {
                // TODO: CRITICAL: Should ignite by the service's ABS PATH! not the name, use similar technique as CommandStore (store packages).
                if (!this.ignite(service.meta.name)) {
                    Log.warn(`Failed to ignite forked service '${name}'`);
                }
                // TODO: CRITICAL: Below will ONLY work LOCALLY! Remember forked services are ignited
                // TODO: as ForkedService gives syntax error highlight
                else if ((service as any).useSMIS) {
                    const child: ChildProcess | null = this.getFork(service.meta.name);

                    if (child !== null) {
                        (service as any).smis = new SMIS(child);
                    }
                    else {
                        Log.warn("Expecting forked service's process to exist");
                    }
                }
            }

            this.emit("start", service.meta.name);

            return true;
        }
        else if (service === null) {
            Log.warn(`Attempted to enable an unregistered service '${name}'`);
        }
        else {
            Log.warn(`Unexpected composition of service '${name}'. (Your service may be invalid)`);
        }

        return false;
    }

    /**
     * Enable all services
     * @return {Promise<number>} The amount of successfully enabled services
     */
    public async startAll(): Promise<number> {
        let enabled: number = 0;

        for (const [name, service] of this.services) {
            if (await this.start(name)) {
                enabled++;
            }
        }

        return enabled;
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

                case ProcessMsgType.StdOutPipe: {
                    if (typeof msg.data !== "string") {
                        Log.warn(`Refusing to log non-string output piped message from service '${name}'`);

                        break;
                    }

                    // TODO: Add a way to restrict this (whitelistEnabled + whitelist?)
                    console.log(msg.data);

                    break;
                }

                default: {
                    if (msg.type < 1000) {
                        Log.warn(`Ignoring invalid message type ${msg.type} from '${name}'`);
                    }
                }
            }
        });

        child.on("disconnect", () => {
            Log.verbose(`Forked service '${name}' disconnected`);
        });

        child.on("close", () => {
            Log.verbose(`Forked service '${name}' closed`);
        });

        this.emit("ignite", name);
        this.heartbeatFork(name);

        // TODO: Debugging
        Log.debug(`Spawned forked service '${name}' @ ${child.pid}`);

        return true;
    }

    public async stopFork(name: string): Promise<boolean> {
        if (!this.forkedServices.has(name)) {
            return false;
        }

        const child: ChildProcess = this.forkedServices.get(name)!;

        return new Promise<boolean>((resolve) => {
            child.send({
                _t: ProcessMsgType.Stop
            }, (error: Error) => {
                if (error) {
                    throw error;
                }

                this.emit("stopFork", name);
                resolve(true);
            });
        });
    }

    public async stopAllForks(): Promise<number> {
        let stopped: number = 0;

        for (const [name, child] of this.forkedServices) {
            if (await this.stopFork(name)) {
                stopped++;
            }
        }

        return stopped;
    }

    /**
     * @param {string} name
     * @return {Readonly<GenericService> | null}
     */
    public getService(name: string): Readonly<IGenericService> | null {
        if (typeof name !== "string" || Util.isEmpty(name) || Array.isArray(name)) {
            return null;
        }

        return this.services.get(name) || null;
    }

    /**
     * Dispose all services
     */
    public async disposeAll(): Promise<void> {
        for (const [name, service] of this.services) {
            await service.dispose();
        }
    }

    /**
     * @return {ReadonlyServiceMap}
     */
    public getAll(): ReadonlyServiceMap {
        return this.services as ReadonlyServiceMap;
    }

    // TODO: .stop()

    public async stopAll(): Promise<this> {
        for (const [name, service] of this.services) {
            await service.stop();
        }

        return this;
    }

    /**
     * @param {string} name The unique identifier of the service
     * @return {boolean}
     */
    public contains(name: string): boolean {
        if (typeof name !== "string" || Util.isEmpty(name)) {
            return false;
        }

        return this.services.has(name);
    }

    public get size(): number {
        return this.services.size;
    }

    protected heartbeatFork(name: string): boolean {
        if (!this.forkedServices.has(name)) {
            return false;
        }

        const child: ChildProcess = this.forkedServices.get(name)!;

        if (this.forkHeartbeats.has(name)) {
            clearTimeout(this.forkHeartbeats.get(name)!);
        }

        // TODO: Auto-restart on timeout
        this.forkHeartbeats.set(name, setTimeout(() => {
            if (!child.killed) {
                child.kill("timeout");
            }

            this.forkHeartbeats.delete(name);
            this.forkedServices.delete(name);
            Log.warn(`Forked service '${name}' timed out`);
        }, ServiceManager.heartbeatTimeout));

        this.emit("heartbeat", name);

        return true;
    }
}
