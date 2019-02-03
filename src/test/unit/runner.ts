import {Runner} from "unit";
import Log, {LogLevel} from "../../core/log";

// Supress log messages.
Log.level = LogLevel.None;

// Import units.
import "./util.unit";
import "./log-serializer.unit";
import "./tslint-serializer.unit";
import "./rgb.unit";
import "./rgba.unit";
import "./messages.unit";
import "./bot.unit";
import "./store.unit";
import "./store-reducers.unit";
import "./languages.unit";
import "./commands.unit";
import "./collection.unit";
import "./services.unit";

// Run tests.
Runner.test();
