// Import tests
import "./switch-parser";
import "./rgb.test";
import "./rgba.test";
import "./utils";
import "./collection";
import "./delta.test";
import "./log-serializer.test";
import "./time-convert";
import "./pagination.test";

// Non-static tests
import "./test-bot";
import "./bot";
import "./send-messages";
import "./long-messages.test";
import "./commands";
import "./services";
import "./tasks";
import "./store";
import "./time-machine";
import "./languages.test";
import "./cmd-decorators.test";

// Other imports
import {testBot} from "./test-bot";

beforeEach(async () => {
    await testBot.deleteLastMessage();
});
