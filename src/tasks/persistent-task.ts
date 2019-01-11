import Task, {IPersistentTask} from "./task";

// TODO: Implement mechanism to handle persistent tasks
export abstract class PeristentTask extends Task implements IPersistentTask {
    public abstract save(): void;
    public abstract sync(): void;
}
