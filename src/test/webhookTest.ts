import {FileOps, Coordinator, GitOps, ScriptOps, GithubEvent, ITaskResult, RunState} from "tusk";
import Util from "../core/Util";
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

    const result: ITaskResult = await coordinator
        .queue(() => GitOps.branch(masterBranch))
        .queue(() => GitOps.deleteBranch(deployBranch), true)
        .queue(() => GitOps.createBranch(deployBranch), true)
        .queue(() => GitOps.branch(deployBranch))
        .queue(() => GitOps.setUpstream(masterBranch))
        .queue(GitOps.pull)
        .queue(() => FileOps.forceRemove(buildDir), true)
        .queue(ScriptOps.npmInstall)
        .queue(ScriptOps.npmBuild)
        .queue(ScriptOps.npmTest)

        .fallback(async () => {
            Log.verbose("Github | Fallback sequence initiated");

            const fallbackResult: ITaskResult = await coordinator
                .queue(() => GitOps.branch(masterBranch))
                .queue(() => GitOps.deleteBranch(deployBranch), true)

                .run();

            Log.verbose(`Github | Fallback sequence completed | Result is '${fallbackResult.state === RunState.OK ? colors.green("OK") : colors.red("FAIL")}'`);
        })

        .run((current: number, left: number, total: number, percentage: number) => {
            Log.verbose(`Github | Processing action ${current}/${total} : ${percentage}% (${left} left)`);
        });

    const time: string = Util.spreadTime(result.time);
    const avgTime: string = Util.spreadTime(result.averageTime);

    Log.verbose(`Github | Process completed in ${time}ms (${avgTime}ms avg.) | Result is '${result.state === RunState.OK ? "OK" : "Failed"}'`);
});

const normalPort: number = coordinator.webhook((body: any) => {
    Log.verbose("Normal | Received webhook trigger with body", body);
}, secret);

Log.verbose(`Github webhook ready | Port ${githubPort}`);
Log.verbose(`Normal webhook ready | Port ${normalPort}`);
