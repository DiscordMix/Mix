import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import Permission from "../../../core/permission";

export default <CommandOptions>{
    meta: {
        name: "nick",
        desc: "Manage nicknames",
        aliases: ["nickname"],

        args: {
            name: "!string"
        }
    },

    restrict: {
        selfPerms: [Permission.ManageNicknames]
    },

    executed: async (context: CommandContext): Promise<void> => {
        await context.message.member.setNickname(context.arguments[0]);
    }
};
