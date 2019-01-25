import {IMeta} from "../../fragments/fragment";
import Service from "../../services/service";

/**
 * @extends Service
 */
export default class TestService extends Service {
    public readonly meta: IMeta = {
        name: "test",
        description: "A service used for unit testing"
    };

    public start(): void {
        //
    }
}
