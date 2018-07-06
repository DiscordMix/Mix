import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import Permission from "../../../core/permission";
import ChatEnvironment from "../../../core/chat-environment";
import {ConsumerAPIv2} from "../consumer-api";

export default <CommandOptions>{
    meta: {
        name: "mute",
        desc: "Mute a user",

        args: {
            user: "!:member",
            reason: "!string",
            evidence: "string"
        }
    },

    restrict: {
        selfPerms: [Permission.ManageRoles],
        issuerPerms: [Permission.ManageRoles],
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: async (context: CommandContext, api: ConsumerAPIv2): Promise<void> => {
        const target = context.arguments[0];
        const modLog = context.message.guild.channels.get("458794765308395521");

        if (!target) {
            context.fail("Guild member not found");

            return;
        }
        else if (!modLog) {
            context.fail("ModLog channel not found");

            return;
        }

        await api.reportCase({
            member: target,
            title: "Mute",
            evidence: context.arguments.length === 3 ? context.arguments[2] : undefined,
            moderator: context.message.author,
            reason: context.arguments[1],
            color: "GOLD"
        });

        /* api.mute({
            moderator: context.sender,
            reason: context.arguments[1],
            user: target,
            channel: modLog,
            evidence: context.arguments.length === 3 ? context.arguments[2] : null,
            message: context.message
        }); */
    }
};
