import {Name, Description} from "../../Decorators/General";
import Service from "../../Services/Service";

@Name("watchdog")
@Description("Bot state supervision service")
export default class extends Service {
    public start() {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}
