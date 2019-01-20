import {Runner} from "unit";
import Log from "../../logging/log";
import LogLevel from "../../logging/log-level";

// Supress log messages
Log.level = LogLevel.None;

// Import units
import "./util.unit";
import "./log-serializer.unit";
import "./rgb.unit";
import "./rgba.unit";
import "./messages.unit";
import "./bot.unit";

// Run tests
Runner.test();
