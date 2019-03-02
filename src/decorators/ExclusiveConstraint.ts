import {Snowflake} from "../core/BotExtra";
import Context from "../commands/Context";

namespace Decorators {
    export type ExclusiveConstraintDelegate = (context: Context) => boolean;

    export default abstract class ExclusiveConstraint {
        public static user(...ids: Snowflake[]): ExclusiveConstraintDelegate {
            return ($) => {
                return ids.includes($.sender.id);
            };
        }

        public static channel(...ids: Snowflake[]): ExclusiveConstraintDelegate {
            return ($) => {
                return ids.includes($.channel.id);
            };
        }

        public static guild(...ids: Snowflake[]): ExclusiveConstraintDelegate {
            return ($) => {
                return !!$.g && ids.includes($.g.id);
            };
        }
    }
}
