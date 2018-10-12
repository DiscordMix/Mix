import Bot from "../core/bot";
import Service from "./service";
import {Log} from "..";

export type ServiceMap = Map<string, Service>;
export type ReadonlyServiceMap = ReadonlyMap<string, Service>;

export default class ServiceManager {
    private readonly bot: Bot;
    private readonly services: ServiceMap;

    /**
     * @param {Bot} bot
     */
    constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {ServiceMap}
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
        if (!this.services.has(service.meta.name)) {
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
     * @return {Service | null}
     */
    public getService(name: string): Readonly<Service> | null {
        return this.services.get(name) || null;
    }

    /**
     * @return {ReadonlyServiceMap}
     */
    public getAll(): ReadonlyServiceMap {
        return this.services as ReadonlyServiceMap;
    }
}
