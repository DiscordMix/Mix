import {PromiseOr} from "..";
import express from "express";
import bodyParser = require("body-parser");
import crypto from "crypto";
import {Server} from "http";

export type Operation = () => PromiseOr<boolean>;

export enum CoordinatorState {
    OK,
    Failed
}

export type WebhookCallback = (body: any) => void;

export interface ICoordinatorRunResult {
    readonly state: CoordinatorState;
    readonly operations: number;
    readonly operationsCompleted: number;
    readonly time: number;
    readonly averageTime: number;
}

export class Coordinator {
    public static webhookPort: number = 3561;

    protected operations: Operation[];
    protected isRunning: boolean;
    protected webhooks: Server[];

    public constructor(...operations: Operation[]) {
        this.operations = operations !== undefined && Array.isArray(operations) ? operations : [];
        this.isRunning = false;
        this.webhooks = [];
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
    public async run(): Promise<ICoordinatorRunResult> {
        if (this.isRunning) {
            throw new Error("Cannot run; Already running");
        }

        this.isRunning = true;

        let completed: number = 0;

        const pending: ICoordinatorRunResult = {
            operations: this.operations.length,
            time: 0,
            averageTime: 0,
            operationsCompleted: 0,
            state: CoordinatorState.Failed
        };

        for (const op of this.operations) {
            const start: number = performance.now();
            const result: PromiseOr<boolean> = op();
            const time: number = performance.now() - start;

            if (result instanceof Promise) {
                await result;
            }
            else if (!result) {
                this.isRunning = false;

                return {
                    ...pending,
                    state: CoordinatorState.Failed,
                    operationsCompleted: completed,
                    averageTime: pending.time / completed
                };
            }

            // TODO: Read-only hotfix
            (pending.time as any) += time;
            completed++;
        }

        this.isRunning = false;

        return {
            ...pending,
            state: CoordinatorState.OK,
            operationsCompleted: completed,
            averageTime: pending.time / completed
        };
    }

    public clear(): this {
        if (this.isRunning) {
            throw new Error("Cannot clear operations while running");
        }

        this.operations.length = 0;

        return this;
    }

    // TODO: Repeated usage of both functions's functionality, .webhook() and .githubWebhook(); Use a generic function
    public webhook(callback: WebhookCallback, secret?: string, port: number = Coordinator.webhookPort++): number {
        const app: express.Express = express();
        const shasum = crypto.createHash("sha1");
        
        let secretHash: string | null = null;

        if (secret !== undefined) {
            // Hash for future authentication
            shasum.update(secret);

            secretHash = shasum.digest("hex");
        }

        app.use(bodyParser.json());

        app.use(bodyParser.urlencoded({
            extended: true
        }));

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
     * @return {number} The port that the webhook will listen on
     */
    public githubWebhook(secret: string, callback: WebhookCallback, port: number = Coordinator.webhookPort++): number {
        const app: express.Express = express();
        const shasum = crypto.createHash("sha1");

        // Hash for future authentication
        shasum.update(secret);

        const secretHash: string = shasum.digest("hex");

        app.use(bodyParser.json());

        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.post("/github", (req, res) => {
            const inputHash: string | undefined = req.header("X-Hub-Signature");

            if (!inputHash || inputHash !== secretHash) {
                res.status(401).end("Unauthorized");

                return;
            }

            res.status(200).end("OK");
            callback(req.body);
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