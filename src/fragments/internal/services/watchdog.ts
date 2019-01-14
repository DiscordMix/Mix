import {Service} from "../../..";
import {Name, Description} from "../../../decorators/general";

@Name("watchdog")
@Description("Bot state supervision service")
export default class WatchdogService extends Service {
    public start(): void {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}
