import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import Utils from "../../../core/utils";
import Permission from "../../../core/permission";
import ChatEnvironment from "../../../core/chat-environment";
import {GuildMember} from "discord.js";

function mute(member: GuildMember): void {
    member.addRole(member.guild.roles.find("name", "Muted"));
}

const command: CommandOptions = {
    meta: {
        name: "mute",
        desc: "Mute a user",

        args: {
            user: "!:user",
            reason: "!string"
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

    executed: (context: CommandExecutionContext): void => {
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

        mute(target);

        Utils.send({
            title: "Mute | Case #0",
            color: "BLUE",
            message: `<@${target.user.id}> (${target.user.username}) was muted for **${context.arguments[1]}**`,
            channel: modLog,
            user: context.sender,
            footer: `Muted by ${context.sender.username}`
        });
    }
};

export default command;
