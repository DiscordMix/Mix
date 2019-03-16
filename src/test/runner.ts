import {Runner} from "unit";
import Log, {LogLevel} from "../core/log";

// Supress log messages.
Log.level = LogLevel.None;

// Don't write logs for tests.
Log.write = false;

// Run preparation stage.
import "./prepare";

// Import units.
import "./Uncategorized/Util";
import "./Uncategorized/logSerializer";
import "./Uncategorized/TslintSerializer";
import "./bot/bot";
import "./Uncategorized/tasks";
import "./Store/Store";
import "./Store/StoreReducers";
import "./Uncategorized/languages";
import "./Uncategorized/commands";
import "./Uncategorized/Collection";
import "./Uncategorized/services";
import "./Uncategorized/TimeMachine";
import "./Uncategorized/TimeConvert";
import "./Uncategorized/FlagParser";
import "./Uncategorized/CommandParser";
import "./Uncategorized/decorators";
import "./bot/botDispose";

// Run tests.
Runner.test();
