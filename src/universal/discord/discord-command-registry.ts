import CommandRegistry, {CommandPackage, ICommandRegistry} from "../../commands/command-registry";
import {IDiscordBot} from "./discord-bot";
import {InternalCommand} from "../../core/bot-extra";
import {PromiseOr} from "@atlas/xlib";

export interface IDiscordCommandRegistry extends ICommandRegistry {
    release(name: string): PromiseOr<boolean>;
    isReleased(name: string): boolean;
    getReleased(): ReadonlyMap<string, string>;
}

export default class DiscordCommandRegistry extends CommandRegistry implements IDiscordCommandRegistry {
    public readonly bot: IDiscordBot;
    
    protected readonly released: Map<string, string>;

    public constructor(bot: IDiscordBot) {
        super(bot);

        this.bot = bot;

        /**
         * @type {string[]}
         * @readonly
         */
        this.released = new Map();
    }

    public async release(name: string): Promise<boolean> {
        // Internal commands should not be released
        if (this.bot.internalCommands.includes(name as InternalCommand)) {
            return false;
        }
        else if (this.contains(name) && !this.isReleased(name)) {
            const cmdPackg: CommandPackage = this.commands.get(name) as CommandPackage;

            await cmdPackg.instance.dispose();
            await this.remove(name, (this.commands.get(name) as CommandPackage).instance.aliases);
            delete require.cache[cmdPackg.path];
            this.released.set(name, cmdPackg.path);

            return true;
        }

        return false;
    }

    public isReleased(name: string): boolean {
        return this.released.has(path.basename(name).split(".")[0]);
    }

    public getReleased(): ReadonlyMap<string, string> {
        return this.released;
    }

    public remove(name: string, aliases: string[]): boolean {
        if (this.isReleased(name) && !this.released.delete(name)) {
            return false;
        }

        return super.remove(name, aliases);
    }

    public contains(name: string): boolean {
        return super.contains(name) || this.isReleased(name);
    }
}
