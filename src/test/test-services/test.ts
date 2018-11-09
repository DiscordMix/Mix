import {Service} from "../..";
import {IFragmentMeta} from "../../fragments/fragment";

export default class TestService extends Service {
    public readonly meta: IFragmentMeta = {
        name: "test",
        description: "A service used for unit testing"
    };

    public start(): void {
        //
    }
}