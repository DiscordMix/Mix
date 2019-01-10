// Import tests
import "./switch-parser";
import "./rgb";
import "./rgba";
import "./utils";
import "./collection";
import "./delta";
import "./log-serializer";
import "./time-convert";
import "./pagination";

// Non-static tests
import "./test-bot";
import "./bot";
import "./send-messages";
import "./long-messages";
import "./commands";
import "./services";
import "./tasks";
import "./store";
import "./time-machine";
import "./languages";

// Other imports
import {testBot} from "./test-bot";

beforeEach(async () => {
    await testBot.deleteLastMessage();
});