import Command from "../command";
import CommandContext from "../command-context";
import JsonAuthStore from "../auth-stores/json-auth-store";
import {GuildMember} from "discord.js";

export default abstract class SetAuth extends Command {
    readonly meta = {
        name: "setauth",
        description: "Manage authentication levels"
    };

    readonly args = {
        user: "!:member",
        auth: "!number"
    };

    readonly restrict = {
        auth: -1 // Owner
    };

    public static async executed(context: CommandContext): Promise<void> {
        if (context.arguments[1] < 0) {
            await context.fail("Authorization level must be higher than zero.");

            return;
        }

        const member: GuildMember = <GuildMember>context.arguments[0];

        const result: boolean = (<JsonAuthStore>context.bot.authStore).setUserAuthority(
            context.message.guild.id,
            member.id,
            context.arguments[1]
        );

        await (<JsonAuthStore>context.bot.authStore).save();

        if (!result) {
            await context.fail("That authorization level does not exist.");

            return;
        }

        await context.ok(`<@${member.id}> now has authorization level of **${context.arguments[1]}**.`);
    }
};
