// Environment variables
require("dotenv").config();

import {Bot, Log} from "..";
import Settings from "../core/settings";
import path from "path";
import {Snowflake, Guild, TextChannel, Message, MessageEmbed} from "discord.js";
import CommandContext from "../commands/command-context";
import ResponseHelper from "../core/response-helper";
import {expect} from "chai";
import {LogLevel} from "../core/log";
import {EBotEvents} from "../core/bot";

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

    // TODO:
    public $longMessages(): string {
        //this.getResponseHelper().ok("Hello world");

        return "test";
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

// Tests
beforeEach(async () => {
    await testBot.deleteLastMessage();
});

describe("init", () => {
    it("should init and login", () => {
        return init();
    });
});

describe("send messages", () => {
    it("should should send an embed message using ok()", async () => {
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

describe("longMessages", () => {
    it("should trim long messages", () => {
        const result: string = testBot.$longMessages();

        // TODO:
        expect(result).to.equal("test");
    });
});

describe("disconnect", () => {
    it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
    });
});