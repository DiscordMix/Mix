import {Unit, Test, Assert, Is, Does, Feed, Mock} from "unit";
import {init, testBot} from "../TestBot";
import DiscordEvent from "../../core/DiscordEvent";
import TestData from "../TestData";

@Unit("Bot")
default class {
    @Test("Should be initially suspended")
    public beSuspended() {
        Assert.true(testBot.suspended);
    }

    @Test("Should init and login")
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

    @Test("Should have correct options")
    public haveCorrectOptions() {
        Assert.false(testBot.options.showAsciiTitle);
        Assert.false(testBot.options.useConsoleInterface);

        // TODO: Add more.
    }

    @Test("Should have no owner")
    public haveNoOwner() {
        Assert.that(testBot.owner, Is.undefined);
    }

    @Test("Should have default argument resolvers")
    public defaultArgResolvers() {
        // TODO: Comparing these objects will not work since testBot's argumentResolvers are united using spread operator.
        // Assert.equal(testBot.argumentResolvers, DefaultArgResolvers);
    }

    @Test("Should not handle invalid messages")
    @Feed(undefined)
    @Feed(null)
    @Feed("")
    @Feed("test")
    @Feed([])
    public async notHandleInvalidMsgs(input: any) {
        Assert.false(await testBot.handle.message(input));
    }

    @Test("Should have correct internal commands")
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
