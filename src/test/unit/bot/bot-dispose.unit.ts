import {unit, test, Assert, Is, Mock} from "unit";
import TestBot, {testBot} from "../test-bot";

@unit("Bot Dispose")
default class {
    @test("reconnect(): should reconnect the bot without throwing")
    public reconnect_doesNotThrow() {
        return new Promise(async (resolve) => {
            let resultError: Error | null = null;

            // Mock the destroy() Discord.JS client method.
            testBot.client.destroy = Mock.fn(testBot.client.destroy)
                .returnOnce(undefined)
                .proxy;

            // Mock the login() Discord.JS client method.
            testBot.client.login = Mock.fn(testBot.client.login)
                .returnOnce(new Promise(() => {}))
                .proxy;

            try {
                await testBot.reconnect();
            }
            catch (error) {
                resultError = error;
            }

            Assert.that(resultError, Is.null);

            resolve();
        });
    }

    @test("reload(): should reload modules")
    public async reload_reloadModules() {
        await testBot.reload();

        // TODO: Verify modules were re-loaded.
    }

    @test("disconnect(): should disconnect the bot")
    public async disconnect_shouldDisconnect() {
        const result: TestBot = await testBot.disconnect();

        // TODO: Additional verification that the bot disconnected (was dispose called?).

        Assert.that(result, Is.object);
        Assert.that(result.client.user, Is.null);
    }
}
