import {Coordinator, GithubEvent, ICoordinatorRunResult, CoordinatorState} from "../automation/coordinator";
import ScriptOperations from "../automation/predefied-ops/scripts";
import GitOperations from "../automation/predefied-ops/git";
import FileSystemOperations from "../automation/predefied-ops/file-system";
import Utils from "../core/utils";
import Log from "../core/log";
import colors from "colors";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";
const deployBranch: string = "webhook_deploy";
const masterBranch: string = "dev-2.0";
const buildDir: string = "./dist";

const githubPort: number = coordinator.githubWebhook(secret, async (event: GithubEvent, body: any) => {
    const ref: string = body.ref as string;

    Log.verbose(`Github | Processing webhook trigger to ref '${ref}' | Event is '${event}'`);

    // Verify that action is being performed to desired branch(es)
    if (event !== GithubEvent.Push || !ref || !ref.endsWith(`/${masterBranch}`)) {
        Log.verbose("Github | Ignoring event");

        return;
    }

    const result: ICoordinatorRunResult = await coordinator
        .then(() => GitOperations.branch(masterBranch))
        .then(() => GitOperations.deleteBranch(deployBranch), true)
        .then(() => GitOperations.createBranch(deployBranch), true)
        .then(() => GitOperations.branch(deployBranch))
        .then(() => GitOperations.setUpstream(masterBranch))
        .then(GitOperations.pull)
        .then(() => FileSystemOperations.forceRemove(buildDir), true)
        .then(ScriptOperations.npmInstall)
        .then(ScriptOperations.npmBuild)
        .then(ScriptOperations.npmTest)

        .fallback(async () => {
            Log.verbose("Github | Fallback sequence initiated");

            const result: ICoordinatorRunResult = await coordinator
                .then(() => GitOperations.branch(masterBranch))
                .then(() => GitOperations.deleteBranch(deployBranch), true)

                .run();

            Log.verbose(`Github | Fallback sequence completed | Result is '${result.state === CoordinatorState.OK ? colors.green("OK") : colors.red("FAIL")}'`);
        })

        .run((current: number, left: number, total: number, percentage: number) => {
            Log.verbose(`Github | Processing action ${current}/${total} : ${percentage}% (${left} left)`);
        });

    const time: string = Utils.spreadTime(result.time);
    const avgTime: string = Utils.spreadTime(result.averageTime);

    Log.verbose(`Github | Process completed in ${time}ms (${avgTime}ms avg.) | Result is '${result.state === CoordinatorState.OK ? "OK" : "Failed"}'`);
});

const normalPort: number = coordinator.webhook((body: any) => {
    Log.verbose("Normal | Received webhook trigger with body", body);
}, secret);

Log.verbose(`Github webhook ready | Port ${githubPort}`);
Log.verbose(`Normal webhook ready | Port ${normalPort}`);