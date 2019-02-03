import {Service} from "../../..";
import {Name, Description} from "../../../decorators/general";

@Name("stats")
@Description("Bot analytics collection service")
export default class StatsService extends Service {
    public start(): void {
        // TODO: Implement
        // Log.info("Stats collection service started!");
    }
}
