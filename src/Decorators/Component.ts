import {DecoratorUtils} from "./DecoratorUtils";
import ChatEnv from "../core/ChatEnv";
import Log from "../core/Log";

/**
 * Represents a decorator proxy function.
 */
export type DecoratorProxy = ((target: any, key: string) => any) | any;

export interface ICommandComponentOpts {
    readonly description: string;
    readonly cooldown: number;
    readonly env: ChatEnv;
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

            return target;
        };
    }

    public static fragment<T = any>(name: string, options?: T): DecoratorProxy {
        // TODO: Implement.
        throw Log.notImplemented;
    }
}
