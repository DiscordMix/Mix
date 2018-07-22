import { Command, ChatEnvironment, Permission, CommandContext } from "../..";

export default abstract class Kick extends Command {
    readonly meta = {
        name: "kick",
        description: "Kick a member from the server"
    };

    readonly args = {
        target: "!:user",
        reason: "string"
    };

    readonly newArgs = [
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
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.selfPermissions = [Permission.KickMembers];
        this.restrict.issuerPermissions = [Permission.KickMembers];
    }

    public executed(context: CommandContext): void {
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
    }
}