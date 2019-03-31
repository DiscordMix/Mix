import {unit, test, Assert, Is, Does, target} from "unit";
import {testBot} from "../testBot";
import TestData from "../testData";
import {Bot} from "../..";

@unit("Bot Dispose")
default class {
    @test("should reconnect the bot without throwing")
    @target(Bot.prototype.reconnect)
    public reconnect_doesNotThrow() {
        return new Promise(async (resolve) => {
            let resultError: Error | null = null;

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

    @test("should reload modules")
    @target(Bot.prototype.reload)
    public async reload_reloadModules() {
        await testBot.reload();

        // TODO: Verify modules were re-loaded.
    }

    @test("should disconnect the bot and dispose resources")
    @target(Bot.prototype.disconnect)
    public async disconnect_shouldDisconnect() {
        const result: Bot = await testBot.disconnect();

        // TODO: Additional verification that the bot disconnected (was dispose called?).

        Assert.that(result, Is.object);

        Assert.that(result.client.user,
            Is.object,
            Does.haveProperty("id")
        );

        Assert.equal(result.client.user.id, TestData.id);
    }
}
