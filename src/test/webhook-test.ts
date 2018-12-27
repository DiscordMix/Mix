import {Coordinator, GithubEvent, ICoordinatorRunResult, CoordinatorState} from "../automation/coordinator";
import ScriptOperations from "../automation/predefied-ops/scripts";
import GitOperations from "../automation/predefied-ops/git";
import FileSystemOperations from "../automation/predefied-ops/file-system";
import Utils from "../core/utils";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";
const deployBranch: string = "webhook_deploy";
const masterBranch: string = "dev-2.0";
const buildDir: string = "./dist";

const githubPort: number = coordinator.githubWebhook(secret, async (event: GithubEvent, body: any) => {
    const ref: string = body.ref as string;

    console.log(`Github | Processing webhook trigger to ref '${ref}' | Event is '${event}'`);

    if (event !== GithubEvent.Push || !ref || !ref.endsWith(`/${masterBranch}`)) {
        return;
    }

    const result: ICoordinatorRunResult = await coordinator
        .then(() => GitOperations.branch(masterBranch))
        .then(() => GitOperations.deleteBranch(deployBranch), true)
        .then(() => GitOperations.createBranch(deployBranch), true)
        .then(() => GitOperations.branch(deployBranch))
        .then(() => GitOperations.setUpstream(masterBranch))
        .then(GitOperations.pull)
        .then(() => FileSystemOperations.forceRemove(buildDir))
        .then(ScriptOperations.npmInstall)
        .then(ScriptOperations.npmBuild)
        .then(ScriptOperations.npmTest)

        .fallback(async () => {
            console.log("Github | Fallback sequence initiated");

            const result: ICoordinatorRunResult = await coordinator
                .then(() => GitOperations.branch(masterBranch))
                .then(() => GitOperations.deleteBranch(deployBranch), true)

                .run();

            console.log(`Github | Fallback sequence completed | Result is '${result.state === CoordinatorState.OK ? "OK" : "Failed"}'`);
        })

        .run((current: number, left: number, total: number, percentage: number) => {
            console.log(`Github | Processing action ${current}/${total} : ${percentage}% (${left} left)`);
        });

    const time: string = Utils.spreadTime(result.time);
    const avgTime: string = Utils.spreadTime(result.averageTime);

    console.log(`Github | Process completed in ${time}ms (${avgTime}ms avg.) | Result is '${result.state === CoordinatorState.OK ? "OK" : "Failed"}'`);
});

const normalPort: number = coordinator.webhook((body: any) => {
    console.log("Normal | Received webhook trigger with body", body);
}, secret);

console.log(`Github webhook ready | Port ${githubPort}`);
console.log(`Normal webhook ready | Port ${normalPort}`);