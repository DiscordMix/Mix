import Command, {CommandAuth} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import JsonAuthStore from "../../../commands/auth-stores/json-auth-store";
import {GuildMember} from "discord.js";

export interface ISetAuthArgs {
    readonly member: GuildMember;
    readonly auth: number;
}

export default class SetAuth extends Command {
    readonly meta = {
        name: "setauth",
        description: "Manage authentication levels"
    };

    readonly args = {
        user: "!:member",
        auth: "!number"
    };

    constructor() {
        super();

        this.restrict.auth = CommandAuth.Owner;
    }

    public async executed(context: CommandContext, args: ISetAuthArgs): Promise<void> {
        if (args.auth < 0) {
            await context.fail("Authorization level must be higher than zero.");

            return;
        }

        const result: boolean = (<JsonAuthStore>context.bot.authStore).setUserAuthority(
            context.message.guild.id,
            args.member.id,
            args.auth
        );

        await (<JsonAuthStore>context.bot.authStore).save();

        if (!result) {
            await context.fail("That authorization level does not exist.");

            return;
        }

        await context.ok(`<@${args.member.id}> now has authorization level of **${args.auth}**.`);
    }
};
