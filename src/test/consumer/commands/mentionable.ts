import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {Role} from "discord.js";
import Permission from "../../../core/permission";

export default <CommandOptions>{
    meta: {
        name: "mentionable",
        desc: "Toggle a role mentionable",

        args: {
            role: "!string"
        }
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ],

        selfPerms: [Permission.ManageRoles]
    },

    // TODO: Add support by id
    executed: async (context: CommandContext): Promise<void> => {
        const role: Role | undefined = context.message.guild.roles.get(context.arguments[0]);

        if (!role) {
            await context.fail("Role not found.");

            return;
        }

        await role.setMentionable(!role.mentionable);

        if (role.mentionable) {
            await context.ok(`Role <@${role.id}> is now mentionable.`);
        }
        else {
            await context.ok(`Role <@${role.id}> is no longer mentionable.`);
        }
    }
};
