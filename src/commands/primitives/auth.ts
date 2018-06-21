import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "auth",
        desc: "View your authentication level"
    },

    executed: (context: CommandExecutionContext): void => {
        context.ok(`Your authentication level is **${context.bot.authStore.getAuthLevel(context.message.guild.id, context.sender.id)}**`);
    }
};

export default command;
