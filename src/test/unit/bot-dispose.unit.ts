import {Unit, Test, Assert, Is, Mock} from "unit";
import TestBot, {testBot} from "../test-bot";

@Unit("Bot Dispose")
default class {
    @Test("should restart the bot without throwing")
    public restart_doesNotThrow() {
        return new Promise(async (resolve) => {
            const error: Error | null = null;

            // Mock the destroy() Discord.js client method.
            testBot.client.destroy = Mock.fn(testBot.client.destroy)
                .returnOnce(undefined)
                .invoker;

            try {
                await testBot.restart(false);
            }
            catch (error) {
                error = error;
            }

            Assert.that(error, Is.null);

            resolve();
        });
    }

    @Test("should disconnect the bot")
    public async disconnect_shouldDisconnect() {
        const result: TestBot = await testBot.disconnect();

        Assert.that(result, Is.object);
        Assert.that(result.client.user, Is.null);
    }
}
