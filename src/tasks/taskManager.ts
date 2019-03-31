import Bot from "../core/bot";
import Log from "../core/log";
import Util from "../util/util";
import Loader, {IPackage} from "../fragments/loader";
import Task from "./task";
import {PromiseOr} from "@atlas/xlib";
import {Mutable} from "../util/helpers";

export interface ITaskManager {
    register(task: Task): boolean;
    get(name: string): Task | null;
    unschedule(name: string): boolean;
    trigger(name: string): PromiseOr<boolean>;
    unregisterAll(): PromiseOr<this>;
    disable(name: string): PromiseOr<boolean>;
    enableAll(): number;
    contains(name: string): boolean;
    loadAll(path: string): PromiseOr<number>;
}

/**
 * Manages, triggers, and executes tasks.
 */
export default class TaskManager implements ITaskManager {
    protected readonly bot: Bot;
    protected readonly tasks: Map<string, Task>;
    protected readonly scheduler: Map<string, NodeJS.Timeout>;

    public constructor(bot: Bot) {
        this.bot = bot;
        this.tasks = new Map();
        this.scheduler = new Map();
    }

    /**
     * Register a task.
     * @param {Task} task The task that will be registered.
     * @return {boolean} Whether the task was registered.
     */
    public register(task: Task): boolean {
        if (this.tasks.has(task.meta.name)) {
            return false;
        }

        this.tasks.set(task.meta.name, task);

        return true;
    }

    /**
     * Retrieve a task by it's name.
     * @param {string} name The name of the task to search for.
     * @return {Task | null} The task or null if it was not found.
     */
    public get(name: string): Task | null {
        if (Util.isEmpty(name) || typeof name !== "string") {
            return null;
        }

        return this.tasks.get(name) || null;
    }

    /**
     * Retrieve a task by it's name.
     * @param name The name of the task to search for
     * @return {Task} The task found.
     */
    public forceGet(name: string): Task {
        return this.get(name) as Task;
    }

    /**
     * Unschedule a registered task.
     * @param {string} name The name of the task to unschedule.
     * @return {boolean} Whether the task was successfully unscheduled.
     */
    public unschedule(name: string): boolean {
        if (!this.tasks.has(name)) {
            return false;
        }

        const task: Task = this.tasks.get(name) as Task;

        if (this.scheduler.has(task.meta.name)) {
            this.scheduler.delete(task.meta.name);

            return true;
        }

        return false;
    }

    /**
     * Trigger a registered task.
     * @param {string} name The name of the task to trigger.
     * @return {Promise<boolean>} Whether the specified task was triggered.
     */
    public async trigger(name: string): Promise<boolean> {
        if (Util.isEmpty(name) || typeof name !== "string") {
            return false;
        }

        if (this.tasks.has(name)) {
            const task: Task = this.tasks.get(name) as Task;

            this.unschedule(task.meta.name);

            if (task.interval === -1) {
                await this.run(name);

                return true;
            }
            else if (task.interval < 1000) {
                Log.warn(`Refusing to run task '${name}'; Interval must be 1 second (1000ms) or higher`);

                return false;
            }
            else {
                this.scheduler.set(task.meta.name, setInterval(async () => {
                    if (task.maxIterations !== -1 && task.iterations >= task.maxIterations) {
                        await this.disable(task.meta.name);
                    }
                    else if (await task.canRun()) {
                        await this.run(name);
                    }
                }, task.interval) as NodeJS.Timeout);

                return true;
            }
        }

        return false;
    }

    /**
     * Disable all registered tasks.
     */
    public async unregisterAll(): Promise<this> {
        for (const [name, task] of this.tasks) {
            await this.disable(name);
        }

        return this;
    }

    /**
     * Disable a registered task.
     * @param {string} name The name of the task to disable.
     * @return {Promise<boolean>} Whether the specified task was disabled.
     */
    public async disable(name: string): Promise<boolean> {
        if (!this.tasks.has(name)) {
            return false;
        }

        const task: Task = this.tasks.get(name) as Task;

        await task.dispose();
        clearInterval(this.scheduler.get(task.meta.name) as NodeJS.Timeout);
        this.scheduler.delete(task.meta.name);

        return true;
    }

    /**
     * Enable all registered tasks.
     */
    public enableAll(): number {
        let enabled: number = 0;

        for (const [name, task] of this.tasks) {
            if (this.trigger(name)) {
                enabled++;
            }
        }

        return enabled;
    }

    /**
     * Determine if a certain task is registered.
     * @param {string} name The name of the task to search.
     * @return {boolean} Whether the specified task is registered.
     */
    public contains(name: string): boolean {
        if (!name) {
            return false;
        }

        return this.tasks.has(name);
    }

    /**
     * Load tasks from a directory.
     * @param {string} path The directory path to scan.
     * @return {Promise<number>} The amount of tasks successfully loaded.
     */
    public async loadAll(path: string): Promise<number> {
        const candidates: string[] | null = await Loader.scan(path, true);

        if (candidates === null) {
            return 0;
        }

        const loaded: IPackage[] | null = await Loader.loadMultiple(candidates);

        if (loaded !== null) {
            for (const loadedItem of loaded) {
                this.register(new (loadedItem.module as any)(this.bot));
            }

            return loaded.length;
        }

        return 0;
    }

    /**
     * Run a registered task.
     * @param {string} name The name of the task to run.
     * @return {boolean} Whether the specified task was executed.
     */
    protected run(name: string): boolean {
        if (!this.tasks.has(name)) {
            return false;
        }

        const task: Task = this.tasks.get(name) as Task;

        task.run();
        (task as Mutable<Task>).iterations++;
        (task as Mutable<Task>).lastIteration = Date.now();

        return true;
    }
}
