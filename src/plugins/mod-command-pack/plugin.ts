import CommandLoader from "../../commands/command-loader";

const globalAny: any = global;
const loader: CommandLoader = globalAny.commandLoader;

async function init() {
    await loader.loadAll("./commandStore");
}

init();
