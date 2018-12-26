import {Coordinator, GithubEvent, ICoordinatorRunResult, CoordinatorState} from "../automation/coordinator";
import ScriptOperations from "../automation/predefied-ops/scripts";
import GitOperations from "../automation/predefied-ops/git";
import FileSystemOperations from "../automation/predefied-ops/file-system";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";

const githubPort: number = coordinator.githubWebhook(secret, async (event: GithubEvent, body: any) => {
    console.log(`Github | Processing webhook trigger | Event is ${event}`);

    if (event !== GithubEvent.Push) {
        return;
    }

    const result: ICoordinatorRunResult = await coordinator
        .onlyIf(ScriptOperations.npmTest)
        .then(GitOperations.pull)
        .then(() => FileSystemOperations.forceRemove("./dist"))
        .then(ScriptOperations.npmInstall)
        .run();

    console.log(`Github | Process completed | Result is ${result.state === CoordinatorState.OK ? "OK" : "Failed"}`, result);
});

const normalPort: number = coordinator.webhook((body: any) => {
    console.log("Normal | Received webhook trigger with body", body);
}, secret);

console.log(`Github webhook ready | Port ${githubPort}`);
console.log(`Normal webhook ready | Port ${normalPort}`);