import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import Permission from "../../../core/permission";
import {Role} from "discord.js";

export default <CommandOptions>{
    meta: {
        name: "lockdown",
        desc: "Lockdown the guild"
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
            "VIEW_CHANNEL",
            "READ_MESSAGES",
            "READ_MESSAGE_HISTORY"
        ]);

        await context.ok(":lock: Guild is now under lockdown.");
    }
};
