import {Bot} from "..";
import {Task} from "./task";

export default class TaskManager {
    private readonly bot: Bot;
    private readonly tasks: Map<string, Task>;
    private readonly scheduler: Map<string, number>;

    public constructor(bot: Bot) {
        this.bot = bot;
        this.tasks = new Map();
    }

    public registerTask(task: Task): boolean {
        if (this.tasks.has(task.meta.name)) {
            return false;
        }

        this.tasks.set(task.meta.name, task);

        return true;
    }

    public enable(name: string): boolean {
        if (this.tasks.has(name)) {
            const task: Task = this.tasks.get(name) as Task;

            if (task.canEnable()) {

            }

            return true;
        }
        
        return false;
    }

    public isRegistered(name: string): boolean {
        return this.tasks.has(name);
    }
}