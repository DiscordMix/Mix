import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import SetupHelper, {SetupHelperResult} from "../../../core/setup-helper";
import {ConsumerAPIv2} from "../consumer-api";
import {RichEmbed, TextChannel} from "discord.js";

export default <CommandOptions>{
    meta: {
        name: "embed",
        desc: "Create an embed"
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ]
    },

    executed: async (context: CommandContext, api: ConsumerAPIv2): Promise<void> => {
        const setup: SetupHelper | null = SetupHelper.fromContext({
            context: context,
            title: "Create Embed"
        });

        if (!setup) {
            await context.fail("Operation failed. (Unable to create SetupHelper instance)");

            return;
        }

        const result: SetupHelperResult = await setup
            .input("Where would you like to post the embed?")
            .input("What will the embed contain?")
            .input("What color will the embed be?")
            .finish();

        const channel = api.getChannel(result.responses[0]);

        if (!channel || !(channel instanceof TextChannel)) {
            await context.fail("Channel does not exist or it is not a text channel.");

            return;
        }

        channel.send(new RichEmbed()
            .setDescription(result.responses[1])
            .setColor(result.responses[2].toUpperCase()));
    }
};
