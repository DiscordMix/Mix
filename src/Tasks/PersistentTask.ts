import Task, {IPersistentTask} from "./Task";

// TODO: Implement mechanism to handle persistent tasks.
export abstract class PeristentTask extends Task implements IPersistentTask {
    public abstract save(): void;
    public abstract sync(): void;
}
