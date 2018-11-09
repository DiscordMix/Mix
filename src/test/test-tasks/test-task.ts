import {Task} from "../..";
import {IFragmentMeta} from "../../fragments/fragment";

export default class DoSomeMathTask extends Task {
    public readonly meta: IFragmentMeta = {
        name: "do-some-math",
        description: "Do some math!",
    };

    public run(): void {
        10*5/5+2;
    }
}
