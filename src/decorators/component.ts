import {DecoratorUtils} from "./decorator-utils";
import {SpecificConstraints} from "../commands/command";
import ChatEnv from "../core/chat-env";
import Log from "../core/log";

/**
 * Represents a decorator proxy function.
 */
export type DecoratorProxy = ((target: any, key: string) => any) | any;

export interface ICommandComponentOpts {
    readonly description: string;
    readonly cooldown: number;
    readonly env: ChatEnv;
    readonly specific: SpecificConstraints;
}

export default abstract class Component {
    public static command(name: string, options?: Partial<ICommandComponentOpts>): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            target = DecoratorUtils.overrideMeta(target, "name", name);

            if (options === undefined || typeof options !== "object") {
                return target;
            }

            // General.
            if (typeof options.description === "string") {
                target = DecoratorUtils.overrideMeta(target, "description", options.description);
            }

            // Constraints.
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

    public static fragment<T = any>(name: string, options?: T): DecoratorProxy {
        // TODO: Implement.
        throw Log.notImplemented;
    }
}
