import {CommandOptions} from "../command";
import CommandContext from "../command-context";

export default <CommandOptions>{
    meta: {
        name: "auth",
        desc: "View your authentication level"
    },

    executed: async (context: CommandContext): Promise<void> => {
        const authLevel: string | null = context.bot.authStore.getSchemaRankName(context.bot.authStore.getAuthLevel(context.message.guild.id, context.sender.id));

        await context.ok(`:zap: Your authentication level is **${authLevel !== null ? authLevel.charAt(0).toUpperCase() + authLevel.slice(1) : "Unknown"}**`);
    }
};
