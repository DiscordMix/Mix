export interface IBotStats {
    commandsHandled: number;
    commandsFailed: number;
    messagesSeen: number;
}

export type ReadonlyBotStats = Readonly<IBotStats>;

const DefaultBotStats: IBotStats = {
    commandsFailed: 0,
    commandsHandled: 0,
    messagesSeen: 0
};

export interface IStatsCounter {
    reset(): this;
    getAsReadonly(): ReadonlyBotStats;

    readonly stats: IBotStats;
}

/**
 * Allows detailed tracking of statistics and interactions of the bot
 */
export default class StatCounter implements IStatsCounter {
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
     * @return {ReadonlyBotStats}
     */
    public getAsReadonly(): ReadonlyBotStats {
        return this.stats;
    }
}
