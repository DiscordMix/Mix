import {IFragmentMeta} from "../../fragments/fragment";
import Task from "../../tasks/task";

/**
 * @extends Task
 */
export default class TestTask extends Task {
    public readonly meta: IFragmentMeta = {
        name: "do-nothing",
        description: "Does absolutely nothing"
    };

    public run(): void {
        //
    }
}
