import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import Permission from "../../../core/permission";
import {Role} from "discord.js";

export default <CommandOptions>{
    meta: {
        name: "unlock",
        desc: "Unlock the guild from lockdown"
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ],

        selfPerms: [Permission.ManageRoles]
    },

    executed: async (context: CommandContext): Promise<void> => {
        const everyone: Role = context.message.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "CREATE_INSTANT_INVITE",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
            "USE_EXTERNAL_EMOJIS",
            "ADD_REACTIONS",
            "CONNECT",
            "SPEAK",
            "USE_VAD",
            "READ_MESSAGES"
        ]);

        await context.ok(":unlock: Guild is no longer under lockdown.");
    }
};
