import JsonAuthStore from "../../commands/auth-stores/json-auth-store";
import Bot from "../../core/bot";
import Settings from "../../core/settings";
import Log, {LogLevel} from "../../core/log";
import ConsumerAPI from "./consumer-api";
import JsonStore from "../../data-stores/json-store";

const path = require("path");
const baseDir = "./src/test/consumer";

Log.level = LogLevel.Debug;

const settings = new Settings({
    general: {
        token: process.env.AC_TOKEN ? process.env.AC_TOKEN : "",
        prefix: process.env.AC_PREFIX ? process.env.AC_PREFIX : "="
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        behaviours: path.resolve(path.join(__dirname, "./behaviours"))
    }
});

async function start() {
    const userMentionRegex = /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/;

    const bot = await new Bot({
        argumentTypes: {
            user: userMentionRegex,
            role: /(^[0-9]{18}$|^<&[0-9]{18}>$)/,
            channel: /(^[0-9]{18}$|^<#[0-9]{18}>$)/,
            member: userMentionRegex
        },

        settings: settings,

        api: ConsumerAPI,

        authStore: new JsonAuthStore(path.resolve(path.join(baseDir, "auth/schema.json")), path.resolve(path.join(baseDir, "auth/store.json"))),

        dataStore: new JsonStore(path.resolve(path.join(__dirname, "data.json"))),

        autoDeleteCommands: true
    }).setup();

    bot.connect();

    if (bot.dataStore) {
        const store: JsonStore = <JsonStore>bot.dataStore;

        await store.reload();
        ConsumerAPI.store = store;

        const storedCounter = store.get("case_counter");

        ConsumerAPI.caseCounter = storedCounter ? storedCounter : 0;
    }
}

start();
