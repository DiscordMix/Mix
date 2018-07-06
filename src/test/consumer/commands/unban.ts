import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {GuildMember} from "discord.js";
import Permission from "../../../core/permission";
import {CaseOptions} from "../consumer-api";

export default <CommandOptions>{
    meta: {
        name: "unban",
        desc: "Unban a user",

        args: {
            user: "!:user",
            reason: "!string"
        },
    },

    restrict: {
        issuerPerms: [Permission.BanMembers],
        selfPerms: [Permission.BanMembers]
    },

    executed: async (context: CommandContext, api: any): Promise<void> => {
        const member: GuildMember = context.arguments[0];

        if (member.id === context.sender.id) {
            context.fail("You can't unban yourself.");

            return;
        }

        await context.message.guild.unban(context.arguments[0].id);
    }
};
