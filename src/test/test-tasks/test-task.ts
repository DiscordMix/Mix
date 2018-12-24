import {IFragmentMeta} from "../../fragments/fragment";
import Task from "../../tasks/task";

export default class DoSomeMathTask extends Task {
    public readonly meta: IFragmentMeta = {
        name: "do-some-math",
        description: "Do some math!",
    };

    public run(): void {
        10*5/5+2;
    }
}
