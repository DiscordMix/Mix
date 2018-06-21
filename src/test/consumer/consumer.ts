import JsonAuthStore from "../../commands/auth-stores/json-auth-store";
import Bot from "../../core/bot";
import Settings from "../../core/settings";
import Log, {LogLevel} from "../../core/log";

const path = require("path");
const baseDir = "./src/test/consumer";

Log.level = LogLevel.Debug;

const settings = new Settings({
    general: {
        token: "NDM0NDMyOTEwOTQ3Mzg1MzU0.Dg1hpQ.a7iJ7QOEhryfqoS48nDj88ZlAZM",
        prefix: "k-"
    },
    paths: {
        commands: path.resolve(path.join(__dirname, "./commands"))
    }
});

async function start() {
    const bot = await new Bot({
        settings: settings,

        authStore: new JsonAuthStore(path.resolve(path.join(baseDir, "auth/schema.json")), path.resolve(path.join(baseDir, "auth/store.json")))
    }).setup();

    bot.connect();
}

start();
