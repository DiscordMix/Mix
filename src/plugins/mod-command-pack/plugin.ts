import CommandManager from "../../commands/command-manager";
import CommandLoader from "../../commands/command-loader";

const manager: CommandManager = global.commandManager;
const loader: CommandLoader = global.commandLoader;

manager.register(loader.load("./"));
