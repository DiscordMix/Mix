import {IMeta} from "../../fragments/fragment";
import Task from "../../tasks/task";

export default class extends Task {
    public readonly meta: IMeta = {
        name: "do-nothing",
        description: "Does absolutely nothing"
    };

    public run(): void {
        //
    }
}
