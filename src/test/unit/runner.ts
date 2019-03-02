import {Runner} from "unit";
import Log, {LogLevel} from "../../core/Log";

// Supress log messages.
Log.level = LogLevel.None;

// Don't write logs for tests.
Log.write = false;

// Run preparation stage.
import "./Prepare";

// Import units.
import "./uncategorized/util.unit";
import "./uncategorized/log-serializer.unit";
import "./uncategorized/tslint-serializer.unit";
import "./colors/rgb.unit";
import "./colors/rgba.unit";
import "./bot/bot.unit";
import "./uncategorized/tasks.unit";
import "./store/store.unit";
import "./store/store-reducers.unit";
import "./uncategorized/languages.unit";
import "./uncategorized/commands.unit";
import "./uncategorized/collection.unit";
import "./uncategorized/services.unit";
import "./uncategorized/time-machine.unit";
import "./uncategorized/time-convert.unit";
import "./uncategorized/flag-parser.unit";
import "./uncategorized/command-parser.unit";
import "./uncategorized/decorators.unit";
import "./bot/bot-dispose.unit";

// Run tests.
Runner.test();
