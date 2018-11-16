// Environment variables
require("dotenv").config();

import {Bot, Log, Task} from "..";
import Settings from "../core/settings";
import {Snowflake, Guild, TextChannel, Message} from "discord.js";
import CommandContext from "../commands/command-context";
import ResponseHelper from "../core/response-helper";
import {expect, assert} from "chai";
import {LogLevel} from "..";
import {EBotEvents, InternalArgTypes, InternalArgResolvers, IBotOptions} from "../core/bot";
import Language, {ILanguageSource} from "../language/language";

// Test globals
const globalAny: any = global;
const describe: any = globalAny.describe;
const it: any = globalAny.it;

const token: string = process.env.TEST_BOT_TOKEN as string;
const testGuildId: Snowflake = process.env.TEST_GUILD_ID as Snowflake;
const testGuildChannelId: Snowflake = process.env.TEST_CHANNEL_ID as Snowflake;

if (!token) {
    throw new Error("Expecting test token");
}
else if (!testGuildId) {
    throw new Error("Expecting test guild's id");
}
else if (!testGuildChannelId) {
    throw new Error("Expecting test guild's channel");
}

Log.level = LogLevel.None;

export default class TestBot extends Bot {
    public static testGuild: Guild;
    public static testChannel: TextChannel;

    public async deleteLastMessage(): Promise<void> {
        if (!this.client.user) {
            return;
        }

        const lastMessage: Message = this.getLastMessage();

        if (!lastMessage) {
            return;
        }
        else if (lastMessage.deletable) {
            await lastMessage.delete();
        }
    }

    public getLastMessage(): Message {
        return this.client.user.lastMessage;
    }

    public getContext(): CommandContext {
        return new CommandContext({
            bot: this,
            label: "?",

            // TODO: Should we check for a message?
            msg: this.getLastMessage() as Message
        });
    }

    public getResponseHelper(): ResponseHelper {
        return new ResponseHelper(TestBot.testChannel, this, this.client.user);
    }

    // Tests
    public async $sendEmbedMessageOk(): Promise<Message> {
        await this.getResponseHelper().ok("hello world");

        return this.getLastMessage();
    }

    public async $sendEmbedMessageFail(): Promise<Message> {
        await this.getResponseHelper().fail("failed message");

        return this.getLastMessage();
    }

    public async $sendEmbedMessageSend(): Promise<Message> {
        await this.getResponseHelper().send("hello world");

        return this.getLastMessage();
    }

    public async $longMessages(msg: string): Promise<Message> {
        await this.getResponseHelper().ok(msg);

        return this.getLastMessage();
    }
}

let testBot: TestBot = new TestBot({
    settings: new Settings({
        general: {
            token: token,
            prefixes: ["!"]
        }
    })
}, true);

async function init(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        testBot.once(EBotEvents.Ready, () => {
            resolve();
        });

        await testBot.connect();

        // Retrieve test guild and channel
        if (!testBot.client.guilds.has(testGuildId)) {
            throw new Error("Bot is not in the test guild");
        }

        const testGuild: Guild = testBot.client.guilds.get(testGuildId) as Guild;

        if (!testGuild.channels.has(testGuildChannelId)) {
            throw new Error("Test guild does not have test channel");
        }

        const testChannel: TextChannel = testGuild.channels.get(testGuildChannelId) as TextChannel;

        if (testChannel.type !== "text") {
            throw new Error("Test channel is not a text channel");
        }

        // Set channels
        TestBot.testGuild = testGuild;
        TestBot.testChannel = testChannel;
    });
}

// Utility methods
function randomString(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function randomStringX(length: number): string {
    if (length < 1) {
        throw new Error("[randomStringX] Expecting length to be a number higher than 0");
    }

    let finalString: string = "";

    for (let i: number = 0; i < length; i++) {
        finalString += randomString();
    }

    return finalString;
}

// Tests
beforeEach(async () => {
    await testBot.deleteLastMessage();
});

describe("bot", () => {
    it("should init and login", async () => {
        await init();

        expect(testBot.client.user).to.be.an("object");
    });

    // TODO:
    /* it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
        expect(result.client.user).to.be.a("null");
    });

    it("should init and login using only token", async () => {
        testBot = new TestBot(token, true);

        await init();

        // Tests
        expect(testBot.client.user).to.be.an("object");
    }); */

    it("should not be suspended", () => {
        expect(testBot.suspended).to.be.a("boolean").and.to.equal(false);
    });

    it("should have no api set", () => {
        expect(testBot.getAPI()).to.be.a("null");
        expect((testBot as any).api).to.be.a("undefined");
    });

    it("should set api", () => {
        expect(testBot.setAPI({
            name: "john doe",
            age: 100
        })).to.be.an("object");

        const api: any = testBot.getAPI();

        expect(api).to.be.an("object");
        expect(api.name).to.be.a("string").and.to.equal("john doe");
        expect(api.age).to.be.a("number").and.to.equal(100);
    });

    it("should have no owner", () => {
        expect(testBot.owner).to.be.a("undefined");
    });

    it("should have no user groups", () => {
        expect(testBot.userGroups).to.be.an("array");
        expect(testBot.userGroups.length).to.be.a("number").and.to.equal(0);
    });

    it("should have default argument types", () => {
        expect(testBot.argumentTypes).to.be.an("array").and.to.equal(InternalArgTypes);;
    });

    it("should have default argument resolvers", () => {
        expect(testBot.argumentResolvers).to.be.an("array").and.to.equal(InternalArgResolvers);
    });

    it("should not handle invalid messages", async () => {
        expect(await testBot.handleMessage(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage("" as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage("hello" as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage([] as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should have correct internal commands", () => {
        expect(testBot.internalCommands).to.be.an("array");
        expect(testBot.internalCommands.length).to.be.a("number").and.to.equal(3);
        expect(testBot.internalCommands[0]).to.be.a("string").and.to.equal("help");
        expect(testBot.internalCommands[1]).to.be.a("string").and.to.equal("usage");
        expect(testBot.internalCommands[2]).to.be.a("string").and.to.equal("ping");
    });
});

describe("bot timeouts", () => {
    it("should have one timeout set", () => {
        expect(testBot.timeouts.length).to.be.a("number").and.to.equal(1); // TempoEngine timeout
    });

    it("should set a timeout", () => {
        return new Promise((resolve) => {
            testBot.setTimeout(() => {
                // Tests
                expect(testBot.timeouts.length).to.be.a("number").and.to.equal(2);

                resolve();
            }, 100);
        });
    });

    it("should clear timeouts after executing", () => {
        expect(testBot.timeouts.length).to.be.a("number").and.to.equal(1);
    });
});

describe("commands", () => {
    it("should register commands", () => {
        const actualCmds: string[] = ["hi"];
        const fakeCmds: string[] = ["john", "doe"]

        // Actual commands
        for (let i: number = 0; i < actualCmds.length; i++) {
            expect(testBot.commandStore.contains(actualCmds[i])).to.be.a("boolean").and.to.equal(true);
        }

        // Fake commands
        for (let i: number = 0; i < fakeCmds.length; i++) {
            expect(testBot.commandStore.contains(fakeCmds[i])).to.be.a("boolean").and.to.equal(false);
        }

        // Other tests
        expect(testBot.commandStore.contains(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.commandStore.contains(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.commandStore.contains("" as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should not register invalid commands", () => {
        const subjects: any[] = [true, false, null, undefined, "hello", "", "    ", 1, 0, -1, []];

        for (let i: number = 0; i < subjects.length; i++) {
            expect(testBot.commandStore.register(subjects[i])).to.be.a("boolean").and.to.equal(false);
        }
    });
});

describe("services", () => {
    it("should register services", () => {
        expect(testBot.services.contains("test")).to.be.a("boolean").and.to.equal(true);
        expect(testBot.services.contains("fake")).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.getAll().size).to.be.a("number").and.to.equal(1);
    });

    it("should not register invalid services", () => {
        expect(testBot.services.register([] as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(["hello"] as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register("" as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register("hello" as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(3 as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should not enable invalid services", async () => {
        expect(await testBot.services.start("fake")).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start("")).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(3 as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start({} as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start([] as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(["hello"] as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should be able to retrieve services", () => {
        expect(testBot.services.getService("test")).to.be.an("object");
    });

    it("should not be able to retrieve invalid services", () => {
        expect(testBot.services.getService("fake")).to.be.a("null");
        expect(testBot.services.getService("")).to.be.a("null");
        expect(testBot.services.getService({} as any)).to.be.a("null");
        expect(testBot.services.getService([] as any)).to.be.a("null");
        expect(testBot.services.getService(undefined as any)).to.be.a("null");
        expect(testBot.services.getService(null as any)).to.be.a("null");
        expect(testBot.services.getService(["hello"] as any)).to.be.a("null");
        expect(testBot.services.getService(3 as any)).to.be.a("null");
    });
});

describe("tasks", () => {
    it("should register tasks", () => {
        const actualTasks: string[] = ["do-some-math"];
        const fakeTasks: string[] = ["doe", "john"]

        // Actual tasks
        for (let i: number = 0; i < actualTasks.length; i++) {
            const check: boolean = testBot.tasks.contains(actualTasks[i]);

            expect(check).to.be.a("boolean");
            expect(check).to.equal(true);
        }

        // Fake tasks
        for (let i: number = 0; i < fakeTasks.length; i++) {
            const check: boolean = testBot.tasks.contains(fakeTasks[i]);

            expect(check).to.be.a("boolean");
            expect(check).to.equal(false);
        }

        // Task properties
        const task: Task = testBot.tasks.get("do-some-math") as Task;

        expect(task.meta).to.be.an("object");
        expect(task.meta.name).to.be.a("string");
        expect(task.meta.name).to.equal("do-some-math");
        expect(task.meta.description).to.be.a("string");
        expect(task.meta.description).to.equal("Do some math!");
        expect(task.maxIterations).to.be.a("number");
        expect(task.maxIterations).to.equal(-1);
        expect(task.lastIteration).to.be.a("number");
        expect(task.lastIteration).to.not.equal(-1);
        expect(task.iterations).to.be.a("number");
        expect(task.iterations).to.equal(1);

        // Other tests
        expect(testBot.tasks.contains(undefined as any)).to.be.a("boolean");
        expect(testBot.tasks.contains(undefined as any)).to.equal(false);

        expect(testBot.tasks.contains(null as any)).to.be.a("boolean");
        expect(testBot.tasks.contains(null as any)).to.equal(false);

        expect(testBot.tasks.contains("" as any)).to.be.a("boolean");
        expect(testBot.tasks.contains("" as any)).to.equal(false);
    });

    it("should trigger tasks", () => {
        const triggerResult: boolean = testBot.tasks.trigger("do-some-math");

        expect(triggerResult).to.be.a("boolean");
        expect(triggerResult).to.equal(true);

        // Other tests
        expect(testBot.tasks.trigger("")).to.be.a("boolean");
        expect(testBot.tasks.trigger("")).to.equal(false);

        expect(testBot.tasks.trigger(undefined as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(undefined as any)).to.equal(false);

        expect(testBot.tasks.trigger(null as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(null as any)).to.equal(false);

        expect(testBot.tasks.trigger(1 as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(1 as any)).to.equal(false);

        expect(testBot.tasks.trigger({} as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger({} as any)).to.equal(false);

        expect(testBot.tasks.trigger([] as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger([] as any)).to.equal(false);
    });

    it("should update tasks after triggering", () => {
        const task: Task = testBot.tasks.get("do-some-math") as Task;

        expect(task).to.be.an("object");
        expect(task.lastIteration).to.be.a("number");
        expect(task.lastIteration).to.not.equal(-1);
        expect(task.iterations).to.be.a("number");
        expect(task.iterations).to.equal(2);
    });
});

describe("languages", () => {
    it("should register languages", () => {
        expect(testBot.language).to.be.an("object");

        const language: Language = testBot.language as Language;
        const languages: ReadonlyMap<string, ILanguageSource> = language.getLanguages();

        expect(languages.size).to.be.a("number").and.to.equal(1);
        expect(language.setDefault("test-language")).to.be.a("boolean").and.to.equal(true);
        expect((language as any).default).to.be.an("object");
    });

    it("should return language values", () => {
        const language: Language = testBot.language as Language;

        expect(language.get("name")).to.be.a("string").and.to.equal("john doe");
        expect(language.get("occupation")).to.be.a("string").and.to.equal("tester");
    });

    it("should not return invalid language keys", () => {
        const language: Language = testBot.language as Language;

        expect(language.get("fake")).to.be.a("null");
        expect(language.get("")).to.be.a("null");
        expect(language.get(null as any)).to.be.a("null");
        expect(language.get(undefined as any)).to.be.a("null");
        expect(language.get({} as any)).to.be.a("null");
        expect(language.get([] as any)).to.be.a("null");
        expect(language.get(3 as any)).to.be.a("null");
    });

    it("should not set invalid default languages", () => {
        const language: Language = testBot.language as Language;

        expect(language.setDefault("f")).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault("")).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault(3 as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault({} as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault([] as any)).to.be.a("boolean").and.to.equal(false);
    });
});

describe("send messages", () => {
    it("should send an embed message using ok()", async () => {
        const message: Message = await testBot.$sendEmbedMessageOk();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":white_check_mark: hello world");
    });

    it("should send an embed message using fail()", async () => {
        const message: Message = await testBot.$sendEmbedMessageFail();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(15158332); // Red
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":thinking: failed message");
    });

    it("should send an embed message using send()", async () => {
        const message: Message = await testBot.$sendEmbedMessageSend();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(0);
    });
});

describe("long messages", () => {
    it("should trim long messages", async () => {
        const randomStr: string = randomStringX(50);
        const message: Message = await testBot.$longMessages(randomStr);

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0]).to.be.an("object");
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":white_check_mark: " + randomStr.substring(0, 1024 - 19 - 4) + " ...");
    });
});

describe("restart", () => {
    it("should restart without throwing", () => {
        return new Promise((resolve) => {
            assert.doesNotThrow(async () => {
                await testBot.restart(false);

                resolve();
            });
        });
    });
});

describe("disconnect", () => {
    it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
        expect(result.client.user).to.be.a("null");
    });
});