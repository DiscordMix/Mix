import {Runner} from "unit";
import Log, {LogLevel} from "../../core/log";

// Supress log messages
Log.level = LogLevel.None;

// Import units
import "./util.unit";

// Run tests
Runner.test();
