import {Name, Description} from "../../decorators/general";
import Service from "../../services/service";

@Name("stats")
@Description("Bot analytics collection service")
export default class extends Service {
    public start(): void {
        // TODO: Implement
        // Log.info("Stats collection service started!");
    }
}
