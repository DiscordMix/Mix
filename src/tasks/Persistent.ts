import Task, {IPersistent} from "./Task";

namespace Tasks {
    // TODO: Implement mechanism to handle persistent tasks.
    export abstract class PeristentTask extends Task implements IPersistent {
        public abstract save(): void;
        public abstract sync(): void;
    }
}
