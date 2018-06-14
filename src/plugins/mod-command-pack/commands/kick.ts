import {CommandOptions} from "../../../commands/command";
import Permission from "../../../core/permission";
import CommandExecutionContext from "../../../commands/command-execution-context";

const command: CommandOptions = {
    executed: async (context: CommandExecutionContext) => {
        context.ok("hello world from the kick command");

        return;
    },
    meta: {
        name: "kick",
        desc: "Kick an user or bot from the server",
        args: {
            target: "!:user",
            reason: "string"
        }
    },
    restrict: {
        selfPerms: [Permission.KickMembers],
        issuerPerms: [Permission.KickMembers]
    }
};

export default command;
