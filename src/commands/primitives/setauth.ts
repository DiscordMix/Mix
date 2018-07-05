import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";
import JsonAuthStore from "../auth-stores/json-auth-store";
import {GuildMember} from "discord.js";

const command: CommandOptions = {
    meta: {
        name: "setauth",
        desc: "Manage authentication levels",

        args: {
            user: "!:member",
            auth: "!number"
        }
    },

    restrict: {
        auth: -1 // Owner
    },

    executed: async (context: CommandExecutionContext): Promise<void> => {
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

export default command;
