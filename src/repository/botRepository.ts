import Bot from "../core/bot";
import {Delegate} from "../util/helpers";

export default class BotRepository {
    protected static readonly globalRepository: BotRepository = new BotRepository();

    public static getGlobal(): BotRepository {
        return this.globalRepository;
    }

    protected readonly bots: Map<number, Bot>;
    protected readonly tags: Map<string, number[]>;

    public constructor() {
        this.bots = new Map();
        this.tags = new Map();
    }

    public add(instance: Bot): void {
        // Ensure instance does not already exist.
        if (this.bots.has(instance.instanceId)) {
            throw new Error("Instance already exists");
        }

        // Register the instance onto the map.
        this.bots.set(instance.instanceId, instance);
    }

    public contains(instanceId: number): boolean {
        return this.bots.has(instanceId);
    }

    public iterate(callback: Delegate): void {
        // Iterate through bot list.
        for (const bot of this.bots) {
            // Invoke callback for each bot.
            callback(bot);
        }
    }

    public tag(instanceId: number, tag: string): void {
        // Retrieve the existing instances, if applicable.
        let instances: number[] | undefined = this.tags.get(tag);

        // Ensure tag is not already linked to the provided instance.
        if (this.tags.has(tag) && instances!.includes(instanceId)) {
            throw new Error("Instance already linked to tag");
        }

        // Create instances array if it does not exist.
        if (instances == undefined) {
            // Apply empty array as default.
            this.tags.set(tag, []);

            // Retrieve and assign the reference.
            instances = this.tags.get(tag)!;
        }

        // Insert the new instance onto the tag list.
        instances.push(instanceId);
    }

    public get(instanceId: number): Bot | null {
        return this.bots.get(instanceId) || null;
    }

    public findByTag(tag: string): Bot[] | null {
        // Return null if tag does not exist.
        if (!this.tags.has(tag)) {
            return null;
        }

        // Create the resulting array.
        let result: Bot[] = [];

        // Retrieve the instance ids associated with the provided tag.
        const instanceIds: number[] = this.tags.get(tag)!;

        // Map instance ids onto their corresponding bot instances.
        result = instanceIds.map((instanceId: number): Bot => {
            // Ensure instance is is linked to a bot instance.
            if (!this.bots.has(instanceId)) {
                throw new Error("Corrupted instance counter");
            }

            // Return the corresponding bot instance.
            return this.bots.get(instanceId)!;
        })

        // Return the resulting array.
        return result;
    }
}
