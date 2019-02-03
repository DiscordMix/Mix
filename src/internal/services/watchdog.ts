import {Name, Description} from "../../decorators/general";
import Service from "../../services/service";

@Name("watchdog")
@Description("Bot state supervision service")
export default class extends Service {
    public start(): void {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}
