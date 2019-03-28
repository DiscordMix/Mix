import {unit, test, Assert, Is, Does, feed, Mock} from "unit";
import {init, testBot} from "../TestBot";
import DiscordEvent from "../../core/DiscordEvent";
import TestData from "../testData";

@unit("Bot")
default class {
    @test("should be initially suspended")
    public beSuspended() {
        Assert.true(testBot.suspended);
    }

    @test("should init and login")
    public async initAndLogin() {
        // Mock Discord.JS' client login.
        testBot.client.login = Mock.fn(testBot.client.login)
            .once((): Promise<void> => {
                (testBot.client.user as any) = {
                    id: TestData.id
                };

                testBot.client.emit(DiscordEvent.Ready);

                // Return a promise because internally (bot.connect) .catch is used.
                return new Promise(() => {});
            })

            .proxy;

        await init();

        Assert.that(testBot.client.user, Is.object);
    }

    @test("should have correct options")
    public haveCorrectOptions() {
        Assert.false(testBot.options.showAsciiTitle);
        Assert.false(testBot.options.useConsoleInterface);

        // TODO: Add more.
    }

    @test("should have no owner")
    public haveNoOwner() {
        Assert.that(testBot.owner, Is.undefined);
    }

    @test("should have default argument resolvers")
    public defaultArgResolvers() {
        // TODO: Comparing these objects will not work since testBot's argumentResolvers are united using spread operator.
        // Assert.equal(testBot.argumentResolvers, DefaultArgResolvers);
    }

    @test("should not handle invalid messages")
    @feed(undefined)
    @feed(null)
    @feed("")
    @feed("test")
    @feed([])
    public async notHandleInvalidMsgs(input: any) {
        Assert.false(await testBot.handle.message(input));
    }

    @test("should have correct internal commands")
    public haveCorrectInternalCmds() {
        Assert.that(testBot.internalCommands,
            Is.array,
            Does.haveLength(3)
        );

        Assert.equal(testBot.internalCommands[0], "help");
        Assert.equal(testBot.internalCommands[1], "usage");
        Assert.equal(testBot.internalCommands[2], "ping");
    }
}
