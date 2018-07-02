import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import Utils from "../../../core/utils";
import Permission from "../../../core/permission";
import ChatEnvironment from "../../../core/chat-environment";
import {GuildMember, Message, RichEmbed, User} from "discord.js";

const command: CommandOptions = {
    meta: {
        name: "mute",
        desc: "Mute a user",

        args: {
            user: "!:user",
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

    executed: (context: CommandExecutionContext, api: any): void => {
        const target = context.message.guild.member(context.arguments[0]);
        const modLog = context.message.guild.channels.get("458794765308395521");

        if (!target) {
            context.fail("Guild member not found");

            return;
        }
        else if (!modLog) {
            context.fail("ModLog channel not found");

            return;
        }

        api.mute({
            moderator: context.sender,
            reason: context.arguments[1],
            user: target,
            channel: modLog,
            evidence: context.arguments.length === 3 ? context.arguments[2] : null,
            message: context.message
        });
    }
};

export default command;
