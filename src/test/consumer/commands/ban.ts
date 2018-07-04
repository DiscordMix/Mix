import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import {GuildMember} from "discord.js";
import Permission from "../../../core/permission";

export default <CommandOptions>{
    meta: {
        name: "ban",
        desc: "Ban a user",

        args: {
            user: "!:member",
            reason: "!string"
        },
    },

    restrict: {
        issuerPerms: [Permission.BanMembers]
    },

    executed: (context: CommandExecutionContext): Promise<void> => {
        return new Promise((resolve) => {
            const member: GuildMember = context.arguments[0];

            if (!member.bannable) {
                context.fail("Unable to ban that person.");

                return;
            }

            member.ban({
                days: 1,
                reason: context.arguments[1]
            }).then(() => {
                resolve();
            }).catch(async (error: Error) => {
                // TODO: Does it actually await this?
                await context.fail(`Operation failed. (${error.message})`);
            });
        });
    }
};
