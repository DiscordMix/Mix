import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";

export default class Auth extends Command {
    readonly meta = {
        name: "auth",
        description: "View your authentication level"
    };

    public async executed(context: CommandContext): Promise<void> {
        let authLevel: string | null = null;

        if (context.sender.id !== context.bot.owner) {
            authLevel = context.bot.authStore.getSchemaRankName(context.bot.authStore.getAuthLevel(context.message.guild.id, context.sender.id));
        }
        else {
            authLevel = "Owner";
        }


        await context.ok(`:zap: Your authentication level is **${authLevel !== null ? authLevel.charAt(0).toUpperCase() + authLevel.slice(1) : "Unknown"}**`);
    }
};
