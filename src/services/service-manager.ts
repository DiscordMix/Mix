import Bot from "../core/bot";
import Service from "./service";

export default class ServiceManager {
    private readonly bot: Bot;
    private readonly services: Array<Service>;

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
         * @type {Array<Service>}
         * @private
         * @readonly
         */
        this.services = [];
    }

    /**
     * @param {Service} service
     * @return {boolean}
     */
    register(service: Service): boolean {
        if (!this.getService(service.meta.name)) {
            this.services.push(service);

            return true;
        }

        return false;
    }

    /**
     * @param {Array<Service>} multipleServices
     * @return {number}
     */
    registerMultiple(multipleServices: Array<Service>): number {
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
     * @return {boolean}
     */
    enable(name: string): boolean {
        const service: Service | null = this.getService(name);

        if (service) {
            service.enabled(this.bot, this.bot.getAPI());

            return true;
        }

        return false;
    }

    /**
     * Enable all services
     * @return {number} The amount of successfully enabled services
     */
    enableAll(): number {
        let enabled: number = 0;

        for (let i = 0; i < this.services.length; i++) {
            if (this.enable(this.services[i].meta.name)) {
                enabled++;
            }
        }

        return enabled;
    }

    /**
     * @param {string} name
     * @return {Service | null}
     */
    getService(name: string): Service | null {
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].meta.name === name) {
                return this.services[i];
            }
        }

        return null;
    }
}
