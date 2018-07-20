import CommandContext from "../command-context";
import { Command } from "../..";

export default abstract class Auth extends Command {
    readonly meta = {
        name: "auth",
        description: "View your authentication level"
    };

    async executed(context: CommandContext): Promise<void> {
        const authLevel: string | null = context.bot.authStore.getSchemaRankName(context.bot.authStore.getAuthLevel(context.message.guild.id, context.sender.id));

        await context.ok(`:zap: Your authentication level is **${authLevel !== null ? authLevel.charAt(0).toUpperCase() + authLevel.slice(1) : "Unknown"}**`);
    }
};
