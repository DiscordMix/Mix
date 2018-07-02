import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import ChatEnvironment from "../../../core/chat-environment";
import ConsumerAPI from "../consumer-api";
import Utils from "../../../core/utils";

const command: CommandOptions = {
    meta: {
        name: "warn",
        desc: "Warn an user",

        args: {
            target: "!:user",
            reason: "!string",
            evidence: "string"
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

    // TODO: Throws unknown message
    executed: async (context: CommandExecutionContext, api: any): Promise<void> => { // TODO: api type not working for some reason
        const target = context.message.guild.member(Utils.resolveId(context.arguments[0].id));
        const modLog = context.message.guild.channels.get("458794765308395521");

        if (!target) {
            context.fail("Guild member not found");

            return;
        }
        else if (!modLog) {
            context.fail("ModLog channel not found");

            return;
        }
        else if (context.sender.id === target.user.id) {
            context.fail("You can't warn yourself");

            return;
        }
        else if (target.user.bot) {
            context.fail("You can't warn a bot");

            return;
        }

        api.warn({
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
