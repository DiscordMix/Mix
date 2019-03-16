import {IBot} from "../core/botExtra";
import {IBuilder} from "./builder";
import Log from "../core/log";

export interface IBotBuilder extends IBuilder<IBot> {
    token(token: string): this;
    prefixes(prefixes: string | string[]): this;
    internalCommands(internalCommands: string[]): this;
    argumentTypes(argumentTypes: any): this;
    prefixCommand(prefixCommand: boolean): this;
}

export default class BotBuilder implements IBotBuilder {
    protected readonly settingsBuffer: any;
    protected readonly bot: any;

    public constructor() {
        this.settingsBuffer = [];
    }

    public token(token: string): this {
        this.settingsBuffer.general.token = token;

        return this;
    }

    public prefixes(prefixes: string | string[]): this {
        this.settingsBuffer.general.prefixes = Array.isArray(prefixes) ? prefixes : [prefixes];

        return this;
    }

    public internalCommands(internalCommands: string[]): this {
        this.bot.internalCommands = internalCommands;

        return this;
    }

    public argumentTypes(argumentTypes: any): this {
        this.bot.argumentTypes = argumentTypes;

        return this;
    }

    public prefixCommand(prefixCommand: boolean): this {
        this.bot.prefixCommand = prefixCommand;

        return this;
    }

    public build(): IBot {
        // TODO
        // return new Bot(this.bot);
        throw Log.notImplemented;
    }
}
