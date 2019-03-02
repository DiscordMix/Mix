import {FileOps, Coordinator, GitOps, ScriptOps, GithubEvent, ITaskResult, RunState} from "@atlas/automata";
import colors from "colors";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";
const deployBranch: string = "webhook_deploy";
const masterBranch: string = "dev-2.0";
const buildDir: string = "./dist";

const githubPort: number = coordinator.githubWebhook(secret, async (event: GithubEvent, body: any) => {
    const ref: string = body.ref as string;

    Core.Log.verbose(`Github | Processing webhook trigger to ref '${ref}' | Event is '${event}'`);

    // Verify that action is being performed to desired branch(es)
    if (event !== GithubEvent.Push || !ref || !ref.endsWith(`/${masterBranch}`)) {
        Core.Log.verbose("Github | Ignoring event");

        return;
    }

    const result: ITaskResult = await coordinator
        .then(() => GitOps.branch(masterBranch))
        .then(() => GitOps.deleteBranch(deployBranch), true)
        .then(() => GitOps.createBranch(deployBranch), true)
        .then(() => GitOps.branch(deployBranch))
        .then(() => GitOps.setUpstream(masterBranch))
        .then(GitOps.pull)
        .then(() => FileOps.forceRemove(buildDir), true)
        .then(ScriptOps.npmInstall)
        .then(ScriptOps.npmBuild)
        .then(ScriptOps.npmTest)

        .fallback(async () => {
            Core.Log.verbose("Github | Fallback sequence initiated");

            const fallbackResult: ITaskResult = await coordinator
                .then(() => GitOps.branch(masterBranch))
                .then(() => GitOps.deleteBranch(deployBranch), true)

                .run();

            Core.Log.verbose(`Github | Fallback sequence completed | Result is '${fallbackResult.state === RunState.OK ? colors.green("OK") : colors.red("FAIL")}'`);
        })

        .run((current: number, left: number, total: number, percentage: number) => {
            Core.Log.verbose(`Github | Processing action ${current}/${total} : ${percentage}% (${left} left)`);
        });

    const time: string = Core.Util.spreadTime(result.time);
    const avgTime: string = Core.Util.spreadTime(result.averageTime);

    Core.Log.verbose(`Github | Process completed in ${time}ms (${avgTime}ms avg.) | Result is '${result.state === RunState.OK ? "OK" : "Failed"}'`);
});

const normalPort: number = coordinator.webhook((body: any) => {
    Core.Log.verbose("Normal | Received webhook trigger with body", body);
}, secret);

Core.Log.verbose(`Github webhook ready | Port ${githubPort}`);
Core.Log.verbose(`Normal webhook ready | Port ${normalPort}`);
