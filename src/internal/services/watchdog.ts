import {Name, Description} from "../../decorators/general";
import Service from "../../services/Service";

@Name("watchdog")
@Description("Bot state supervision service")
export default class extends Service {
    public start() {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}
