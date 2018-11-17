import {IFragmentMeta, Service} from "../../..";

export default class WatchdogService extends Service {
    readonly meta: IFragmentMeta = {
        name: "stats",
        description: "Bot stat collection service"
    };

    public start(): void {
        //Log.info("Stats collection service started!");
    }
}