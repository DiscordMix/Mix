import {PromiseOr} from "..";
import express from "express";
import bodyParser = require("body-parser");
import crypto from "crypto";
import {Server} from "http";
import {performance} from "perf_hooks";

export type Operation = () => PromiseOr<boolean>;

export enum CoordinatorState {
    OK,
    Failed
}

export enum GithubEvent {
    CheckRun = "check_run",
    CheckSuite = "check_suite",
    CommitComment = "commit_comment",
    BranchOrTagCreation = "create",
    BranchOrTagDeletion = "delete",
    Deployment = "deployment",
    DeploymentStatus = "deployment_status",
    Fork = "fork",
    GithubAppAuthorization = "github_app_authorization",
    Wiki = "gollum",
    AppInstallation = "installation",
    RepositoryAppInstallation = "installation_repositories",
    IssueComment = "issue_comment",
    Issue = "issues",
    Label = "label",
    MarketplacePurchase = "marketplace_purchase",
    Member = "member",
    Membership = "membership",
    Milestone = "milestone",
    Organization = "organization",
    OrganizationBlock = "org_block",
    PageBuild = "page_build",
    ProjectCard = "project_card",
    Project = "project",
    Public = "public",
    PullRequestReviewComment = "pull_request_review_comment",
    PullRequestReview = "pull_request_review",
    PullRequest = "pull_request",
    Push = "push",
    Repository = "repository",
    RepositoryImport = "repository_import",
    RepositoryVulnerabilityAlert = "repository_vulnerability_alert",
    Release = "release",
    SecurityAdvisory = "security_advisory",
    Status = "status",
    Team = "team",
    TeamRepositoryAdd = "team_add",
    Watch = "watch"
}

export type GithubWebhookCallback<T> = (type: GithubEvent, body: T) => void;

export type WebhookCallback<T> = (body: T) => void;

export type ProgressCallback = (current: number, left: number, total: number, percentage: number) => void;

export interface ICoordinatorRunResult {
    readonly state: CoordinatorState;
    readonly operations: number;
    readonly operationsCompleted: number;
    readonly time: number;
    readonly averageTime: number;
}

// TODO: Implement retry functionality
export class Coordinator {
    public static webhookPort: number = 52671;

    protected operations: Operation[];
    protected isRunning: boolean;
    protected webhooks: Server[];
    protected retryTimes: number;

    public constructor(...operations: Operation[]) {
        this.operations = operations !== undefined && Array.isArray(operations) ? operations : [];
        this.isRunning = false;
        this.webhooks = [];
        this.retryTimes = 0;
    }

    public retry(times: number): this {
        if (this.isRunning) {
            throw new Error("Cannot set retry times while running");
        }

        this.retryTimes = times;

        return this;
    }

    public then(op: Operation): this {
        if (this.isRunning) {
            throw new Error("Cannot append operation while running");
        }

        this.operations.push(op);

        return this;
    }

    public get running(): boolean {
        return this.isRunning;
    }

    // TOOD: Better report of why failed/completed
    public async run(callback?: ProgressCallback, clear: boolean = true): Promise<ICoordinatorRunResult> {
        if (callback !== undefined && typeof callback !== "function") {
            throw new Error("Expecting callback to be a function");
        }
        else if (this.isRunning) {
            throw new Error("Cannot run; Already running");
        }

        this.isRunning = true;

        let completed: number = 0;

        const totalLength: number = this.operations.length;

        const pending: ICoordinatorRunResult = {
            operations: totalLength,
            time: 0,
            averageTime: 0,
            operationsCompleted: 0,
            state: CoordinatorState.Failed
        };

        for (const op of this.operations) {
            if (callback !== undefined) {
                callback(completed + 1, totalLength - (completed + 1), totalLength, Math.round(completed / totalLength * 100));
            }

            const start: number = performance.now();
            const result: PromiseOr<boolean> = op();

            let time: number = Math.round(performance.now() - start);

            if (result instanceof Promise) {
                await result;
                time = Math.round(performance.now() - start);
            }
            else if (!result) {
                this.isRunning = false;

                if (clear) {
                    this.clear();
                }

                return {
                    ...pending,
                    state: CoordinatorState.Failed,
                    operationsCompleted: completed,
                    averageTime: Math.round(pending.time / completed)
                };
            }

            // TODO: Read-only hotfix
            (pending.time as any) += time;
            completed++;
        }

        this.isRunning = false;

        if (clear) {
            this.clear();
        }

        return {
            ...pending,
            state: CoordinatorState.OK,
            operationsCompleted: completed,
            averageTime: Math.round(pending.time / completed)
        };
    }

    public clear(): this {
        if (this.isRunning) {
            throw new Error("Cannot clear operations while running");
        }

        this.operations.length = 0;
        this.conditions.length = 0;

        return this;
    }

    // TODO: Repeated usage of both functions's functionality, .webhook() and .githubWebhook(); Use a generic function
    /**
     * Create a webhook server. Content type must be set to application/json only.
     * @param {GithubWebhookCallback} callback The callback to invoke upon receiving a valid and authorized request
     * @param {string | undefined} secret A key that must be sent as authorization
     * @param {number} port The port that the webhook server will listen on
     */
    public webhook<T = object>(callback: WebhookCallback<T>, secret?: string, port: number = Coordinator.webhookPort++): number {
        // TODO: CRITICAL: Express throws errors (internal errors, 500) into the response stream!
        const app: express.Express = express();
        const shasum = crypto.createHash("sha1");

        let secretHash: string | null = null;

        if (secret !== undefined) {
            // Hash for future authentication
            shasum.update(secret);

            secretHash = shasum.digest("hex");
        }

        app.use(bodyParser.json());

        app.post("/", (req, res) => {
            const inputHash: string | undefined = req.header("authorization");

            if ((!inputHash && secretHash !== null) || inputHash !== secretHash) {
                res.status(401).end("Unauthorized");

                return;
            }

            res.status(200).end("OK");
            callback(req.body);
        });

        this.webhooks.push(app.listen(port));

        return port;
    }

    // TODO: Port may be constant, meaning that it does not ++ on each function call. Same for above. (.webhook())
    /**
     * Create a webhook server for GitHub events. Content type must be set to application/json only.
     * @param {string} secret The secret which must be sent as authorization
     * @param {GithubWebhookCallback} callback The callback to invoke upon valid request with authorization
     * @param {number} port The port that the webhook server will listen on
     * @return {number} The port that the webhook will listen on
     */
    public githubWebhook<T = object>(secret: string, callback: GithubWebhookCallback<T>, port: number = Coordinator.webhookPort++): number {
        // TODO: CRITICAL: Express throws errors (internal errors, 500) into the response stream!
        const app: express.Express = express();

        app.use(bodyParser.json());

        app.post("/github", (req, res) => {
            const inputHash: string | undefined = req.header("X-Hub-Signature");
            const event: GithubEvent | undefined = req.header("X-GitHub-Event") as GithubEvent | undefined;

            if (!inputHash || !event) {
                res.status(401).end("Unauthorized");

                return;
            }
            else {
                const shasum = crypto.createHmac("sha1", secret);

                // TODO: Inefficient, express should already contain a property like this
                shasum.update(JSON.stringify(req.body));

                const secretHash: string = shasum.digest("hex");

                if (!crypto.timingSafeEqual(Buffer.from(secretHash), Buffer.from(inputHash.substr(5)))) {
                    res.status(401).end("Unauthorized");

                    return;
                }
            }

            res.status(200).end("OK");
            callback(event, req.body);
        });

        this.webhooks.push(app.listen(port));

        return port;
    }

    public clearWebhooks(): this {
        for (let i: number = 0; i < this.webhooks.length; i++) {
            this.webhooks[i].close();
            this.webhooks.splice(i, 1);
        }

        return this;
    }
}