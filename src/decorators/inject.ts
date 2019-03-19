import {IBot} from "../core/botExtra";

/**
 * Inject an instance into target.
 */
export default function inject(instanceId: number = 0) {
    return function (target: any) {
        console.log("InjectTarget:", target);
        console.log("InstanceTarget:", InstanceTracker.get(instanceId));
    };
}

/**
 * Keeps track of bot class instances.
 */
export abstract class InstanceTracker {
    // Start at -1 to initially increment to 0.
    protected static counter: number = -1;

    protected static readonly instances: any[] = [];

    /**
     * The amount of existing instances.
     */
    public static get count(): number {
        return this.counter + 1;
    }

    /**
     * Register instance and retrieve the instance
     * counter.
     */
    public static register(instance: IBot): number {
        this.instances.push(instance);

        return this.counter++;
    }

    /**
     * Retrieve a stored instance by the instance
     * id.
     */
    public static get(instanceId: number): IBot {
        return this.instances[instanceId];
    }
}
