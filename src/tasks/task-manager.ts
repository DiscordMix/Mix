import {Bot, Utils} from "..";
import Task from "./task";
import Log from "../core/log";
import FragmentLoader, {IPackage} from "../fragments/fragment-loader";

export default class TaskManager {
    private readonly bot: Bot;
    private readonly tasks: Map<string, Task>;
    private readonly scheduler: Map<string, NodeJS.Timeout>;

    /**
     * @param {Bot} bot
     */
    public constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {Map<string, Task>}
         * @private
         * @readonly
         */
        this.tasks = new Map();

        /**
         * @type {Map<string, NodeJS.Timeout}
         * @private
         * @readonly
         */
        this.scheduler = new Map();
    }

    /**
     * Register a task
     * @param {Task} task
     * @return {boolean}
     */
    public registerTask(task: Task): boolean {
        if (this.tasks.has(task.meta.name)) {
            return false;
        }

        this.tasks.set(task.meta.name, task);

        return true;
    }

    public get(name: string): Task | null {
        if (Utils.isEmpty(name) || typeof name !== "string") {
            return null;
        }

        return this.tasks.get(name) || null;
    }

    /**
     * Unschedule a task
     * @param {string} name
     * @return {boolean}
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
     * Trigger a task
     * @param {string} name
     * @return {boolean}
     */
    public trigger(name: string): boolean {
        if (Utils.isEmpty(name) || typeof name !== "string") {
            return false;
        }

        if (this.tasks.has(name)) {
            const task: Task = this.tasks.get(name) as Task;

            this.unschedule(task.meta.name);

            if (task.interval === -1) {
                this.run(name);

                return true;
            }
            else if (task.interval < 1000) {
                Log.warn(`[TaskManager.enable] Refusing to run task '${name}'; Interval must be 1 second (1000ms) or higher`);

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
     * Run a task
     * @param {string} name
     * @return {boolean}
     */
    private run(name: string): boolean {
        if (!this.tasks.has(name)) {
            return false;
        }

        const task: Task = this.tasks.get(name) as Task;

        task.run();
        (task as any).iterations++;
        (task as any).lastIteration = Date.now();

        return true;
    }

    /**
     * Disable all registered tasks
     * @return {Promise<this>}
     */
    public async unregisterAll(): Promise<this> {
        for (let [name, task] of this.tasks) {
            await this.disable(name);
        }

        return this;
    }

    /**
     * Disable a task
     * @param {string} name
     * @return {Promise<boolean>} Whether the task was disabled
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
     * Enable all tasks
     * @return {number}
     */
    public enableAll(): number {
        let enabled: number = 0;

        for (let [name, task] of this.tasks) {
            if (this.trigger(name)) {
                enabled++;
            }
        }

        return enabled;
    }

    /**
     * Determine if a task is registered
     * @param {string} name
     * @return {boolean}
     */
    public contains(name: string): boolean {
        if (!name) {
            return false;
        }

        return this.tasks.has(name);
    }

    /**
     * Load tasks from a directory
     * @param {string} path
     * @return {Promise<number>} The amount of tasks loaded
     */
    public async loadAll(path: string): Promise<number> {
        const candidates: string[] | null = await FragmentLoader.pickupCandidates(path, true);

        if (candidates === null) {
            return 0;
        }

        const loaded: IPackage[] | null = await FragmentLoader.loadMultiple(candidates);

        if (loaded !== null) {
            for (let i: number = 0; i < loaded.length; i++) {
                this.registerTask(new (loaded[i].module as any)(this.bot));
            }

            return loaded.length;
        }

        return 0;
    }
}