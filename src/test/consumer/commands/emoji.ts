import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import SpecificGroups from "../specific-groups";
import Permission from "../../../core/permission";

const request = require("request").defaults({
    encoding: null
});

export default <CommandOptions>{
    meta: {
        name: "emoji",
        desc: "Add an emoji to the guild",

        args: {
            name: "!string",
            url: "!string"
        }
    },

    restrict: {
        specific: SpecificGroups.staff,
        selfPerms: [Permission.ManageEmojis]
    },

    executed: (context: CommandContext): Promise<void> => {
        return new Promise((resolve) => {
            request.get(context.arguments[1], async (error: Error, response: any, body: any) => {
                await context.message.guild.createEmoji(body, context.arguments[0], undefined, `Requested by ${context.sender.tag} (${context.sender.id})`);
                await context.ok(`Emoji **${context.arguments[0]}** successfully created.`);
                resolve();
            });
        });
    }
};
