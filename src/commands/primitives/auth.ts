import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "auth",
        desc: "View your authentication level"
    },

    executed: async (context: CommandExecutionContext): Promise<void> => {
        const authLevel: string | null = context.bot.authStore.getSchemaRankName(context.bot.authStore.getAuthLevel(context.message.guild.id, context.sender.id));

        await context.ok(`:zap: Your authentication level is **${authLevel !== null ? authLevel.charAt(0).toUpperCase() + authLevel.slice(1) : "Unknown"}**`);
    }
};

export default command;
