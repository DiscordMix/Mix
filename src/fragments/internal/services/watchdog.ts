import {IFragmentMeta, Service} from "../../..";

export default class WatchdogService extends Service {
    public readonly meta: IFragmentMeta = {
        name: "watchdog",
        description: "Bot status supervision service"
    };

    public start(): void {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}
