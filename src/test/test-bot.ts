// Environment variables
require("dotenv").config();

import {Bot, Log, Task} from "..";
import Settings from "../core/settings";
import path from "path";
import {Snowflake, Guild, TextChannel, Message} from "discord.js";
import CommandContext from "../commands/command-context";
import ResponseHelper from "../core/response-helper";
import {expect, assert} from "chai";
import {LogLevel} from "../core/log";
import {EBotEvents, InternalArgTypes, InternalArgResolvers} from "../core/bot";

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

    public constructor(settings: Settings) {
        super({
            settings,

            options: {
                asciiTitle: false,
                consoleInterface: false
            }
        });
    }

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
            message: this.getLastMessage() as Message
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

const testBot: TestBot = new TestBot(new Settings({
    general: {
        token: token,
        prefixes: ["!"]
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "test-commands")),
        emojis: path.resolve(path.join(__dirname, "test-emojis")),
        languages: path.resolve(path.join(__dirname, "test-languages")),
        plugins: path.resolve(path.join(__dirname, "test-plugins")),
        services: path.resolve(path.join(__dirname, "test-services")),
        tasks: path.resolve(path.join(__dirname, "test-tasks")),
    }
}));

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

describe("setup", () => {
    it("should init and login", async () => {
        await init();

        expect(testBot.client.user).to.be.an("object");
    });

    it("should have no owner", () => {
        expect(testBot.owner).to.be.a("undefined");
    });

    it("should have no user groups", () => {
        expect(testBot.userGroups).to.be.an("array");
        expect(testBot.userGroups.length).to.be.a("number");
        expect(testBot.userGroups.length).to.equal(0);
    });

    it("should have default argument types", () => {
        expect(testBot.argumentTypes).to.be.an("array");
        expect(testBot.argumentTypes).to.equal(InternalArgTypes);
    });

    it("should have default argument resolvers", () => {
        expect(testBot.argumentResolvers).to.be.an("array");
        expect(testBot.argumentResolvers).to.equal(InternalArgResolvers);
    });
});

describe("commands", () => {
    it("should have registered commands", () => {
        const actualCmds: string[] = ["hi"];
        const fakeCmds: string[] = ["john", "doe"]

        // Actual commands
        for (let i: number = 0; i < actualCmds.length; i++) {
            const check: boolean = testBot.commandStore.contains(actualCmds[i]);
            
            expect(check).to.be.a("boolean");
            expect(check).to.equal(true);
        }

        // Fake commands
        for (let i: number = 0; i < fakeCmds.length; i++) {
            const check: boolean = testBot.commandStore.contains(fakeCmds[i]);

            expect(check).to.be.a("boolean");
            expect(check).to.equal(false);
        }

        // Other tests
        expect(testBot.commandStore.contains(undefined as any)).to.be.a("boolean");
        expect(testBot.commandStore.contains(undefined as any)).to.equal(false);

        expect(testBot.commandStore.contains(null as any)).to.be.a("boolean");
        expect(testBot.commandStore.contains(null as any)).to.equal(false);

        expect(testBot.commandStore.contains("" as any)).to.be.a("boolean");
        expect(testBot.commandStore.contains("" as any)).to.equal(false);
    });

    it("should not register invalid commands", () => {
        const subjects: any[] = [true, false, null, undefined, "hello", "", "    ", 1, 0, -1, []];

        for (let i: number = 0; i < subjects.length; i++) {
            const result: boolean = testBot.commandStore.register(subjects[i]);

            expect(result).to.be.a("boolean");
            expect(result).to.equal(false);
        }
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

describe("send messages", () => {
    it("should send an embed message using ok()", async () => {
        const message: Message = await testBot.$sendEmbedMessageOk();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number");
        expect(message.embeds.length).to.equal(1);
        expect(message.embeds[0].color).to.be.a("number");
        expect(message.embeds[0].color).to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string");
        expect(message.embeds[0].description).to.equal(":white_check_mark: hello world");
    });

    it("should send an embed message using fail()", async () => {
        const message: Message = await testBot.$sendEmbedMessageFail();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number");
        expect(message.embeds.length).to.equal(1);
        expect(message.embeds[0].color).to.be.a("number");
        expect(message.embeds[0].color).to.equal(15158332); // Red
        expect(message.embeds[0].description).to.be.a("string");
        expect(message.embeds[0].description).to.equal(":thinking: failed message");
    });

    it("should send an embed message using send()", async () => {
        const message: Message = await testBot.$sendEmbedMessageSend();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number");
        expect(message.embeds.length).to.equal(0);
    });
});

describe("long messages", () => {
    it("should trim long messages", async () => {
        const randomStr: string = randomStringX(50);
        const message: Message = await testBot.$longMessages(randomStr);

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number");
        expect(message.embeds.length).to.equal(1);
        expect(message.embeds[0]).to.be.an("object");
        expect(message.embeds[0].color).to.be.a("number");
        expect(message.embeds[0].color).to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string");
        expect(message.embeds[0].description).to.equal(":white_check_mark: " + randomStr.substring(0, 1024 - 19 - 4) + " ...");
    });
});

describe("disconnect", () => {
    it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
    });
});