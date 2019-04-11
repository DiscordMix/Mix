import {unit, test, Assert, Is, Does, feed, Mock} from "unit";
import {init, testBot} from "../testBot";
import DiscordEvent from "../../core/discordEvent";
import testData from "../testData";

@unit("Bot")
default class {
    @test("should be initially suspended")
    public beSuspended() {
        Assert.true(testBot.suspended);
    }

    @test("should have all modules initialized")
    public haveModulesInit() {
        Assert.object(testBot.analytics);
        Assert.object(testBot.argumentResolvers);
        Assert.object(testBot.bCode);
        Assert.object(testBot.client);
        Assert.object(testBot.commandHandler);
        Assert.object(testBot.console);
        Assert.object(testBot.disposables);
        Assert.object(testBot.fragments);
        Assert.object(testBot.handle);
        Assert.object(testBot.i18n);
        Assert.object(testBot.internalCommands);
        Assert.object(testBot.intervals);
        Assert.object(testBot.languages);
        Assert.object(testBot.optimizer);
        Assert.object(testBot.options);
        Assert.object(testBot.paths);
        Assert.object(testBot.registry);
        Assert.object(testBot.services);
        Assert.object(testBot.tasks);
        Assert.object(testBot.temp);
        Assert.object(testBot.timeouts);
    }

    @test("should init and login")
    public async initAndLogin() {
        // Mock Discord.JS' client login.
        testBot.client.login = Mock.fn(testBot.client.login)
            .once((): Promise<void> => {
                (testBot.client.user as any) = {
                    id: testData.id
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
