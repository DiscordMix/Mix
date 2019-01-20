import Log from "../logging/log";
import LogLevel from "../logging/log-level";

// Supress output
Log.level = LogLevel.None;
Log.write = false;

// Import tests
import "./switch-parser.test";
import "./rgb.test";
import "./rgba.test";
import "./util";
import "./collection.test";
import "./delta.test";
import "./log-serializer.test";
import "./time-convert.test";
import "./pagination.test";

// Non-static tests
import "./test-bot";
import "./bot.test";
import "./send-messages.test";
import "./long-messages.test";
import "./commands.test";
import "./services.test";
import "./tasks.test";
import "./store.test";
import "./time-machine.test";
import "./languages.test";
import "./decorators.test";

// Other imports
import {testBot} from "./test-bot";

beforeEach(async () => {
    await testBot.deleteLastMessage();
});
