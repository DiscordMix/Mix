export type BotStats = {
    commandsHandled: number;
    commandsFailed: number;
    messagesSeen: number;
}

export type ReadonlyBotStats = Readonly<BotStats>;

const DefaultBotStats: BotStats = {
    commandsFailed: 0,
    commandsHandled: 0,
    messagesSeen: 0
};

export default class StatCounter {
    public stats: BotStats;

    constructor() {
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