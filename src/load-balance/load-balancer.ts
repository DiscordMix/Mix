import {EventEmitter} from "events";

export interface ILoadBalancer extends EventEmitter {
    readonly threshold: number;
    readonly requestsPerSecond: number;
    readonly requestsPerMinute: number;
    readonly requestsPerHour: number;
}

export default class LoadBalancer extends EventEmitter implements ILoadBalancer {
    public readonly threshold: number;

    public constructor(threshold: number = 10) {
        super();

        this.threshold = threshold;
    }

    // TODO
    public get requestsPerSecond(): number {
        return 0;
    }

    public get requestsPerMinute(): number {
        return 0;
    }

    public get requestsPerHour(): number {
        return 0;
    }
}