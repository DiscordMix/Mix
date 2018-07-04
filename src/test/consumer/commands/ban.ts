import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import {GuildMember} from "discord.js";
import Permission from "../../../core/permission";
import {CaseOptions} from "../consumer-api";

export default <CommandOptions>{
    meta: {
        name: "ban",
        desc: "Ban a user",

        args: {
            user: "!:member",
            reason: "!string",
            evidence: "string"
        },
    },

    restrict: {
        issuerPerms: [Permission.BanMembers],
        selfPerms: [Permission.BanMembers]
    },

    executed: (context: CommandExecutionContext, api: any): Promise<void> => {
        return new Promise((resolve) => {
            const member: GuildMember = context.arguments[0];

            if (member.id === context.sender.id) {
                context.fail("You can't ban yourself.");

                return;
            }
            else if (!member.bannable) {
                context.fail("Unable to ban that person.");

                return;
            }

            member.ban({
                days: 1,
                reason: context.arguments[1]
            }).then(async () => {
                // TODO: Does it actually await this?
                await api.reportCase({
                    moderator: context.sender,
                    color: "RED",
                    reason: context.arguments[1],
                    evidence: context.arguments.length === 3 ? context.arguments[2] : undefined,
                    title: "Ban",
                    member: member
                });

                resolve();
            }).catch(async (error: Error) => {
                // TODO: Does it actually await this?
                await context.fail(`Operation failed. (${error.message})`);
            });
        });
    }
};
