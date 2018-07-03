import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import Permission from "../../../core/permission";

const command: CommandOptions = {
    meta: {
        name: "nick",
        desc: "Change your nickname",
        aliases: ["nickname"],

        args: {
            name: "!string"
        }
    },

    restrict: {
        selfPerms: [Permission.ManageNicknames]
    },

    executed: async (context: CommandExecutionContext): Promise<void> => {
        await context.message.member.setNickname(context.arguments[0]);
    }
};

export default command;
