import {IMeta} from "../../../Fragments/Fragment";
import Service from "../../../Services/Service";

export default class extends Service {
    public readonly meta: IMeta = {
        name: "test",
        description: "A service used for unit testing"
    };

    public start(): void {
        //
    }
}
