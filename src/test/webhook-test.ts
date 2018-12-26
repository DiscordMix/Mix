import {Coordinator, GithubEvent, ICoordinatorRunResult, CoordinatorState} from "../automation/coordinator";
import ScriptOperations from "../automation/predefied-ops/scripts";
import GitOperations from "../automation/predefied-ops/git";
import FileSystemOperations from "../automation/predefied-ops/file-system";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";

const githubPort: number = coordinator.githubWebhook(secret, async (event: GithubEvent, body: any) => {
    console.log(`Github | Processing webhook trigger | Event is '${event}'`);

    if (event !== GithubEvent.Push) {
        return;
    }

    const deployBranch: string = "webhook_deploy";
    const masterBranch: string = "master";
    const buildDir: string = "./dist";

    const result: ICoordinatorRunResult = await coordinator
        .then(() => GitOperations.branch(masterBranch))
        .then(() => GitOperations.deleteBranch(deployBranch))
        .then(() => GitOperations.createBranch(deployBranch))
        .then(GitOperations.pull)
        .then(() => FileSystemOperations.forceRemove(buildDir))
        .then(ScriptOperations.npmInstall)
        .then(ScriptOperations.npmBuild)
        .then(ScriptOperations.npmTest)

        .run((current: number, left: number, total: number, percentage: number) => {
            console.log(`Github | Processing action ${current}/${total} : ${percentage}% (${left} left)`);
        });

    console.log(`Github | Process completed in ${result.time}ms (${result.averageTime}ms avg.) | Result is '${result.state === CoordinatorState.OK ? "OK" : "Failed"}'`);
});

const normalPort: number = coordinator.webhook((body: any) => {
    console.log("Normal | Received webhook trigger with body", body);
}, secret);

console.log(`Github webhook ready | Port ${githubPort}`);
console.log(`Normal webhook ready | Port ${normalPort}`);