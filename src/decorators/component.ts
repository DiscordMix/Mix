import {DecoratorUtils} from "./decorator-utils";
import {SpecificConstraints} from "../commands/command";
import ChatEnv from "../core/chat-env";
import Log from "../core/log";

export interface ICommandComponentOpts {
    readonly description: string;
    readonly cooldown: number;
    readonly env: ChatEnv;
    readonly specific: SpecificConstraints;
}

export default abstract class Component {
    public static Command(name: string, options?: Partial<ICommandComponentOpts>): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            target = DecoratorUtils.overrideMeta(target, "name", name);

            if (options === undefined || typeof options !== "object") {
                return target;
            }

            // General
            if (typeof options.description === "string") {
                target = DecoratorUtils.overrideMeta(target, "description", options.description);
            }

            // Constraints
            if (typeof options.cooldown === "number") {
                target = DecoratorUtils.overrideConstraint(target, "cooldown", options.cooldown);
            }

            if (typeof options.env === "number") {
                target = DecoratorUtils.overrideConstraint(target, "env", options.env);
            }

            if (typeof options.specific === "object") {
                target = DecoratorUtils.overrideConstraint(target, "specific", options.specific);
            }

            return target;
        };
    }

    public static Fragment<T = any>(name: string, options?: T): any {
        // TODO: Implement
        throw Log.notImplemented;
    }
}
