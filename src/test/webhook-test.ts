import {Coordinator, GithubEvent, ICoordinatorRunResult, CoordinatorState} from "../automation/coordinator";
import ScriptOperations from "../automation/predefied-ops/scripts";
import GitOperations from "../automation/predefied-ops/git";
import FileSystemOperations from "../automation/predefied-ops/file-system";
import TestOperations from "../automation/predefied-ops/test";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";

const githubPort: number = coordinator.githubWebhook(secret, async (event: GithubEvent, body: any) => {
    console.log(`Github | Processing webhook trigger | Event is '${event}'`);

    if (event !== GithubEvent.Push) {
        return;
    }

    const deployBranch: string = "webhook_deploy";
    const masterBranch: string = "dev-2.0";
    const buildDir: string = "./dist";

    const result: ICoordinatorRunResult = await coordinator
        .then(() => GitOperations.branch(masterBranch))
        .then(() => GitOperations.deleteBranch(deployBranch))
        .then(() => GitOperations.createBranch(deployBranch))
        .then(() => GitOperations.setUpstream(masterBranch))
        .then(GitOperations.pull)
        .then(() => FileSystemOperations.forceRemove(buildDir))
        .then(ScriptOperations.npmInstall)
        .then(ScriptOperations.npmBuild)
        .then(ScriptOperations.npmTest)

        .fallback(async () => {
            console.log("Github | Fallback sequence initiated");

            const result: ICoordinatorRunResult = await coordinator
                .then(TestOperations.testFalseSync)
                
                .then(() => GitOperations.branch(masterBranch))
                .then(() => GitOperations.deleteBranch(deployBranch))

                .run();

            console.log(`Github | Fallback sequence completed | Result is '${result.state === CoordinatorState.OK ? "OK" : "Failed"}'`);
        })

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