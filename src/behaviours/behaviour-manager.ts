import Bot from "../core/bot";
import Behaviour from "./behaviour";

export default class BehaviourManager {
    private readonly bot: Bot;
    private readonly behaviours: Array<Behaviour>;

    /**
     * @param {Bot} bot
     * @param {string} path
     */
    constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {Array<Behaviour>}
         * @private
         * @readonly
         */
        this.behaviours = [];
    }

    /**
     * @param {Behaviour} behaviour
     * @return {boolean}
     */
    register(behaviour: Behaviour): boolean {
        if (!this.getBehaviour(behaviour.meta.name)) {
            this.behaviours.push(behaviour);

            return true;
        }

        return false;
    }

    /**
     * @param {Array<Behaviour>} multipleBehaviours
     * @return {number}
     */
    registerMultiple(multipleBehaviours: Array<Behaviour>): number {
        let registered: number = 0;

        for (let i: number = 0; i < multipleBehaviours.length; i++) {
            if (this.register(multipleBehaviours[i])) {
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
        const behaviour: Behaviour | null = this.getBehaviour(name);

        if (behaviour) {
            behaviour.enabled(this.bot, this.bot.getAPI());

            return true;
        }

        return false;
    }

    /**
     * Enable all behaviours
     * @return {number} The amount of successfully enabled behaviours
     */
    enableAll(): number {
        let enabled: number = 0;

        for (let i = 0; i < this.behaviours.length; i++) {
            if (this.enable(this.behaviours[i].meta.name)) {
                enabled++;
            }
        }

        return enabled;
    }

    /**
     * @param {string} name
     * @return {Behaviour | null}
     */
    getBehaviour(name: string): Behaviour | null {
        for (let i = 0; i < this.behaviours.length; i++) {
            if (this.behaviours[i].meta.name === name) {
                return this.behaviours[i];
            }
        }

        return null;
    }
}
