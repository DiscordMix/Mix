import {unit, test, Assert, Is, Mock} from "unit";
import TestBot, {testBot} from "../test-bot";

@unit("Bot Dispose")
default class {
    @test("restart(): should restart the bot without throwing")
    public restart_doesNotThrow() {
        return new Promise(async (resolve) => {
            const error: Error | null = null;

            // Mock the destroy() Discord.js client method.
            testBot.client.destroy = Mock.fn(testBot.client.destroy)
                .returnOnce(undefined)
                .proxy;

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

    @test("restart(): should restart and reload modules")
    public async restart_modules() {
        // Mock the disconnect() bot method to avoid creating a new client and using it's login method.
        testBot.disconnect = Mock.fn(testBot.disconnect)
            .returnOnce(new Promise((resolve) => {
                resolve();
            }))

            .proxy;

        // Mock Discord.JS' client login.
        testBot.client.login = Mock.fn(testBot.client.login)
            // Return a promise because internally (bot.connect) .catch is used.
            .returnOnce(new Promise((resolve) => {
                resolve();
            }))

            .proxy;

        await testBot.restart(true);
    }

    @test("disconnect(): should disconnect the bot")
    public async disconnect_shouldDisconnect() {
        const result: TestBot = await testBot.disconnect();

        Assert.that(result, Is.object);
        Assert.that(result.client.user, Is.null);
    }
}
