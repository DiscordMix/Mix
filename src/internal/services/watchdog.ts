import {name, desc} from "../../decorators/general";
import Service from "../../services/service";

@name("watchdog")
@desc("Bot state supervision service")
export default class extends Service {
    public start() {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO: Implement.
    }
}
