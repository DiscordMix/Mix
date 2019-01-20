/**
 * Recorded stats.
 */
export interface IBotStats {
    /**
     * The amount of commands intercepted and handled by the command handler
     */
    commandsHandled: number;

    /**
     * The amount of commands that failed to be executed
     */
    commandsFailed: number;

    /**
     * The amount of messages that the bot has seen in the current session
     */
    messagesSeen: number;
}

export type ReadonlyBotStats = Readonly<IBotStats>;

const DefaultBotStats: IBotStats = {
    commandsFailed: 0,
    commandsHandled: 0,
    messagesSeen: 0
};

export interface IStatsCounter {
    readonly stats: IBotStats;

    reset(): this;
    getAsReadonly(): ReadonlyBotStats;
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
