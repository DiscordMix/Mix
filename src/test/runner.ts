import {Runner} from "unit";
import Log, {LogLevel} from "../core/log";

// Supress log messages.
Log.level = LogLevel.None;

// Don't write logs for tests.
Log.write = false;

// Run preparation stage.
import "./prepare";

// Import units.
import "./uncategorized/util";
import "./uncategorized/logSerializer";
import "./uncategorized/tslintSerializer";
import "./bot/bot";
import "./uncategorized/tasks";
import "./uncategorized/languages";
import "./uncategorized/commands";
import "./uncategorized/collection";
import "./uncategorized/services";
import "./uncategorized/timeMachine";
import "./uncategorized/timeConvert";
import "./uncategorized/flagParser";
import "./uncategorized/commandParser";
import "./uncategorized/decorators";
import "./bot/botDispose";

// Run tests.
Runner.test();
