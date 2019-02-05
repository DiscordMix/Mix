import {DecoratorUtils} from "./decorator-utils";
import Command, {IArgument} from "../commands/command";
import {IMeta} from "../fragments/fragment";
import {DecoratorProxy} from "./component";

/**
 * Set a fragment's meta property.
 * @param {IMeta} meta
 */
export function meta(meta: IMeta): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly meta: IMeta = {
                ...this.meta,
                ...meta
            };
        };
    };
}

/**
 * Set the meta name property of a fragment.
 * @param {string} name
 */
export function name(name: string): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return DecoratorUtils.overrideMeta(target, "name", name);
    };
}

/**
 * Set the meta description property of a fragment.
 * @param {string} description
 */
export function description(description: string): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return DecoratorUtils.overrideMeta(target, "description", description);
    };
}

/**
 * Append name aliases to a command.
 * @param {string[]} aliases The list of aliases.
 */
export function aliases(...aliases: string[]): DecoratorProxy {
    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly aliases: string[] = [...instance.aliases, ...aliases];
        };
    };
}

/**
 * Append arguments to a command.
 * @param {IArgument[]} args The list of arguments.
 */
export function args(...args: IArgument[]): DecoratorProxy {
    return function (target: any) {
        // TODO: It may not be efficient to create a new instance just to extract default properties
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly args: IArgument[] = [...instance.args, ...args];
        };
    };
}
