import JsonAuthStore from "../../commands/auth-stores/json-auth-store";
import Bot from "../../core/bot";
import Settings from "../../core/settings";
import Log, {LogLevel} from "../../core/log";

const path = require("path");
const baseDir = "./src/test/consumer";

Log.level = LogLevel.Debug;

const settings = new Settings({
    general: {
        token: "token_here",
        prefix: "="
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        behaviours: path.resolve(path.join(__dirname, "./behaviours"))
    }
});

async function start() {
    const bot = await new Bot({
        argumentTypes: {
            user: /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/,
            role: /(^[0-9]{18}$|^<&[0-9]{18}>$)/,
            channel: /(^[0-9]{18}$|^<#[0-9]{18}>$)/
        },

        settings: settings,

        authStore: new JsonAuthStore(path.resolve(path.join(baseDir, "auth/schema.json")), path.resolve(path.join(baseDir, "auth/store.json")))
    }).setup();

    bot.connect();
}

start();
