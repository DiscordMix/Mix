import {ChatEnvironment, Command, CommandContext, Permission} from "../..";
import {GuildMember} from "discord.js";
import {Argument, PrimitiveArgType} from "../../commands/command";

type IKickArgs = {
    readonly member: GuildMember;
    readonly reason: string;
}

export default abstract class KickCommand extends Command<IKickArgs> {
    readonly meta = {
        name: "kick",
        description: "Kick a member from the server"
    };

    readonly arguments: Argument[] = [
        {
            name: "member",
            description: "The guild member to kick",
            type: "member",
            required: true
        },
        {
            name: "reason",
            description: "The reason for performing this action",
            type: PrimitiveArgType.String
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        selfPermissions: [Permission.KickMembers],
        issuerPermissions: [Permission.KickMembers]
    };

    public executed(context: CommandContext, args: IKickArgs): void {
        if (args.member.kickable) {
            const name: string = `${args.member.displayName} (${args.member.id})`;

            args.member.kick(args.reason).then(() => {
                context.ok(`${name} was successfully kicked from this server.`);
            }).catch((error: Error) => {
                context.fail(`I was unable to kick that person. (${error.message})`);
            });
        }
        else {
            context.fail("I cannot kick that person.");
        }

        return;
    }
}
