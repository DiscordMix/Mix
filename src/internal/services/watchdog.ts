import {name, description} from "../../Decorators/General";
import Service from "../../Services/Service";

@name("watchdog")
@description("Bot state supervision service")
export default class extends Service {
    public start() {
        // Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}
