import JsonAuthStore from "../../commands/json-auth-store";
import Bot from "../../core/bot";
import Settings from "../../core/settings";

const path = require("path");
const baseDir = "src/test/consumer";

const settings = new Settings({
    general: {
        token: "NDMyNTg3MDQxMzQwMTI5Mjkz.De954Q.rLBj-XOviqqCoyuDb8hhWLtaVN0",
        prefix: "-"
    },
    paths: {
        commands: path.resolve(path.join(__dirname, "./commands"))
    }
});

async function start() {
    const bot = await new Bot({
        settings: settings,

        authStore: new JsonAuthStore(path.join(baseDir, "auth/schema.json"), path.join(baseDir, "auth/store.json"))
    }).setup();

    bot.connect();
}

start();
