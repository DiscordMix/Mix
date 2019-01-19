import {Unit, Test, Assert, Is, JsType, Does} from "unit";
import TestUtils from "../test-utils";
import {testBot} from "../test-bot";
import {Message, MessageEmbed} from "discord.js";

@Unit("Messages")
default class {
    @Test("should trim long messages")
    public async longMessages(): Promise<void> {
        const randomStr: string = TestUtils.randomStringX(50);
        const message: Message = await testBot.$longMessages(randomStr);

        Assert.that(message, Is.type(JsType.Object));

        Assert.that(message.embeds,
            Is.array,
            Does.haveLength(1)
        );

        const embed: MessageEmbed = message.embeds[0];

        Assert.that(embed, Is.type(JsType.Object));
        Assert.equal(embed.color, 3066993); // Green
        Assert.equal(embed.description, ":white_check_mark: " + randomStr.substring(0, 1024 - 19 - 4) + " ...");
    }
}
