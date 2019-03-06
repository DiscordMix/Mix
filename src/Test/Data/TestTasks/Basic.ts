import {IMeta} from "../../../Fragments/Fragment";
import Task from "../../../Tasks/Task";

export default class extends Task {
    public readonly meta: IMeta = {
        name: "do-nothing",
        description: "Does absolutely nothing"
    };

    public run(): void {
        //
    }
}
