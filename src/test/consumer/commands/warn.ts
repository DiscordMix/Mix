import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import Utils from "../../../core/utils";
import ChatEnvironment from "../../../core/chat-environment";

const command: CommandOptions = {
    meta: {
        name: "warn",
        desc: "Warn an user",

        args: {
            target: "!:user",
            reason: "!string"
        }
    },

    restrict: {
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: async (context: CommandExecutionContext): Promise<void> => {
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

        Utils.send({
            channel: modLog,
            user: context.sender,
            message: `<@${target.user.id}> (${target.user.username}) was warned for **${context.arguments[1]}**`,
            footer: `Warned by ${context.sender.username}`,
            color: "GOLD",
            title: "Warn | Case #0"
        });
    }
};

export default command;
