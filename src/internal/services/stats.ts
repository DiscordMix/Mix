import {name, description} from "../../Decorators/General";
import Service from "../../services/service";

@name("stats")
@description("Bot analytics collection service")
export default class extends Service {
    public start() {
        // TODO: Implement
        // Log.info("Stats collection service started!");
    }
}
