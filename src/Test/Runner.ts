import {Runner} from "unit";
import Log, {LogLevel} from "../Core/Log";

// Supress log messages.
Log.level = LogLevel.None;

// Don't write logs for tests.
Log.write = false;

// Run preparation stage.
import "./Prepare";

// Import units.
import "./Uncategorized/Util";
import "./Uncategorized/LogSerializer";
import "./Uncategorized/TslintSerializer";
import "./Bot/Bot";
import "./Uncategorized/Tasks";
import "./Store/Store";
import "./Store/StoreReducers";
import "./Uncategorized/Languages";
import "./Uncategorized/Commands";
import "./Uncategorized/Collection";
import "./Uncategorized/Services";
import "./Uncategorized/TimeMachine";
import "./Uncategorized/TimeConvert";
import "./Uncategorized/FlagParser";
import "./Uncategorized/CommandParser";
import "./Uncategorized/Decorators";
import "./Bot/BotDispose";

// Run tests.
Runner.test();
