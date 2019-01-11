import {IFragmentMeta} from "../../..";
import Service from "../../../services/generic-service";

export default class WatchdogService extends Service {
    public readonly meta: IFragmentMeta = {
        name: "stats",
        description: "Bot stat collection service"
    };

    public start(): void {
        // Log.info("Stats collection service started!");
    }
}
