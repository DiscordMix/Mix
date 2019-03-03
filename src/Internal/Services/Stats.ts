import {Name, Description} from "../../Decorators/General";
import Service from "../../services/service";

@Name("stats")
@Description("Bot analytics collection service")
export default class extends Service {
    public start() {
        // TODO: Implement
        // Log.info("Stats collection service started!");
    }
}
