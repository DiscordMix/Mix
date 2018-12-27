import {Log, LogLevel, Utils} from "..";
import colors from "colors";
import {Coordinator, FileSystemOperations, ScriptOperations, CoordinatorState} from "@atlas/automata";

enum BuildMode {
    Default
}

Log.hiddenItems = true;
Log.level = LogLevel.Debug;

const coordinator: Coordinator = new Coordinator();
const mode: BuildMode = BuildMode.Default;
const buildDir: string = "./dist";

async function build(): Promise<number> {
    const result = await coordinator
        .then(() => {
            Log.verbose("Building project");
            Log.verbose(`Using mode: ${BuildMode[mode].toString().toLowerCase()}`)
        })

        .then(() => FileSystemOperations.forceRemove(buildDir))
        .then(() => ScriptOperations.execute("tsc"))

        .run();

    const time: string = Utils.spreadTime(result.time);
    const avgTime: string = Utils.spreadTime(result.averageTime);
    const state: string = result.state === CoordinatorState.OK ? colors.green("OK") : colors.red("FAIL");

    Log.verbose(`Operation completed with state '${state}' | Took ${time}ms (${avgTime}ms avg.) | ${result.operationsCompleted}/${result.operations} task(s)`);

    return result.operations === result.operationsCompleted ? 0 : 1;
}

build().then((code: number) => process.exit(code));