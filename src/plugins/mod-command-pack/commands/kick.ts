import {CommandOptions} from "../../../commands/command";
import Permission from "../../../core/permission";
import CommandExecutionContext from "../../../commands/command-execution-context";
import ChatEnvironment from "../../../core/chat-environment";

const command: CommandOptions = {
    executed: async (context: CommandExecutionContext) => {
        const targetMember = context.message.guild.member(context.arguments[0]);

        if (targetMember) {
            if (targetMember.kickable) {
                const name = `${targetMember.displayName} (${targetMember.id})`;

                targetMember.kick(context.arguments.length === 2 ? context.arguments[2] : undefined).then(() => {
                    context.ok(`${name} was successfully kicked from this server.`);
                }).catch((error: Error) => {
                    context.fail(`I was unable to kick that person. (${error.message})`);
                });
            }
            else {
                context.fail("I cannot kick that person.");
            }
        }
        else {
            context.fail("Couldn't find that person. Are you sure they're in this server?");
        }

        return;
    },
    meta: {
        name: "kick",
        desc: "Kick an user or bot from the server",
        args: {
            target: "!:user",
            reason: "string"
        },
        newArgs: [
            {
                name: "member",
                desc: "The guild member to kick",
                type: ":user",
                required: true
            },
            {
                name: "reason",
                desc: "The reason for performing this action",
                type: "string"
            }
        ]
    },
    restrict: {
        env: ChatEnvironment.Guild,
        selfPerms: [Permission.KickMembers],
        issuerPerms: [Permission.KickMembers]
    }
};

export default command;
