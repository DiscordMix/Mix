import {PriorityQueue} from "@atlas/xlib";
import {EventEmitter} from "events";
import {Action} from "../core/bot-extra";

export interface ILoadBalancer extends EventEmitter {
    readonly threshold: number;
    readonly requestsPerSecond: number;
    readonly requestsPerMinute: number;
    readonly requestsPerHour: number;

    next(action: Action): this;
}

/**
 * @extends EventEmitter
 */
export default class LoadBalancer extends EventEmitter implements ILoadBalancer {
    public readonly threshold: number;

    private readonly queue: PriorityQueue<Action>;

    public constructor(threshold: number = 10) {
        super();

        this.threshold = threshold;
        this.queue = new PriorityQueue();
    }

    public next(action: Action, highPriority?: boolean): this {
        this.queue.enqueue(action, highPriority);

        return this;
    }

    protected async process(): Promise<this> {
        // TODO: Finish implementing
        /* for (const action of this.queue) {
            await action();
        } */

        return this;
    }

    // TODO
    public get requestsPerSecond(): number {
        return 0;
    }

    // TODO
    public get requestsPerMinute(): number {
        return 0;
    }

    // TODO
    public get requestsPerHour(): number {
        return 0;
    }
}
