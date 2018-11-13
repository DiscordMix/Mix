import Bot from "../core/bot";
import Service from "./service";
import {Log, Utils} from "..";

export type IServiceMap = Map<string, Service>;
export type IReadonlyServiceMap = ReadonlyMap<string, Service>;

export default class ServiceManager {
    private readonly bot: Bot;
    private readonly services: IServiceMap;

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
     * @return {boolean} Whether the service was started
     */
    public enable(name: string): boolean {
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
                if (!service.canStart()) {
                    return false;
                }
            }
            else {
                Log.error(`[ServiceManager.enable] Unexpected type of canEnable service property, expecting either a boolean or function for service '${name}'`);

                return false;
            }

            service.start();

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
     * @return {number} The amount of successfully enabled services
     */
    public enableAll(): number {
        let enabled: number = 0;

        for (let [name, service] of this.services) {
            if (this.enable(name)) {
                enabled++;
            }
        }

        return enabled;
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
