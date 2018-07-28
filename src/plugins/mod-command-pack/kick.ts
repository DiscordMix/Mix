import { Command, ChatEnvironment, Permission, CommandContext } from "../..";
import { GuildMember } from "discord.js";
import { PrimitiveArgumentType, CommandArgument } from "../../commands/command";

export interface KickArgs {
    readonly member: GuildMember;
    readonly reason: string;
}

export default abstract class Kick extends Command {
    readonly meta = {
        name: "kick",
        description: "Kick a member from the server"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The guild member to kick",
            type: "member",
            required: true
        },
        {
            name: "reason",
            description: "The reason for performing this action",
            type: PrimitiveArgumentType.String
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.selfPermissions = [Permission.KickMembers];
        this.restrict.issuerPermissions = [Permission.KickMembers];
    }

    public executed(context: CommandContext, args: KickArgs): void {
        if (args.member.kickable) {
            const name = `${args.member.displayName} (${args.member.id})`;

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