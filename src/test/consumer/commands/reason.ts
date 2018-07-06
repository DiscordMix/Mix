import {CommandOptions} from "../../../commands/command";
import ChatEnvironment from "../../../core/chat-environment";
import CommandContext from "../../../commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "reason",
        desc: "Manage moderation reasons",

        args: {
            caseNum: "!number",
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

    executed: (context: CommandContext): void => {
        // TODO
    }
};
