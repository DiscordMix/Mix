export type IBotStats = {
    commandsHandled: number;
    commandsFailed: number;
    messagesSeen: number;
}

export type IReadonlyBotStats = Readonly<IBotStats>;

const DefaultBotStats: IBotStats = {
    commandsFailed: 0,
    commandsHandled: 0,
    messagesSeen: 0
};

export default class StatCounter {
    public stats: IBotStats;

    public constructor() {
        /**
         * @type {IBotStats}
         */
        this.stats = DefaultBotStats;
    }

    /**
     * Reset recorded stats
     * @return {this}
     */
    public reset(): this {
        this.stats = DefaultBotStats;

        return this;
    }

    /**
     * @return {IReadonlyBotStats}
     */
    public getAsReadonly(): IReadonlyBotStats {
        return this.stats;
    }
}
