import {DecoratorUtils} from "./DecoratorUtils";
import Command, {IArgument} from "../Commands/Command";
import {IMeta} from "../Fragments/Fragment";
import {DecoratorProxy} from "./Component";

/**
 * Set a fragment's meta property.
 */
export function Meta(value: IMeta): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly meta: IMeta = {
                ...this.meta,
                ...value
            };
        };
    };
}

/**
 * Set the meta name property of a fragment.
 * @param {string} value The name of the fragment.
 */
export function Name(value: string): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return DecoratorUtils.overrideMeta(target, "name", value);
    };
}

/**
 * Set the meta description property of a fragment.
 * @param {string} value The description of the fragment.
 */
export function Description(value: string): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return DecoratorUtils.overrideMeta(target, "description", value);
    };
}

/**
 * Append name aliases to a command.
 * @param {string[]} values The list of aliases that represent the command.
 */
export function Aliases(...values: string[]): DecoratorProxy {
    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly aliases: string[] = [...instance.aliases, ...values];
        };
    };
}

/**
 * Append arguments to a command.
 * @param {IArgument[]} values The list of arguments accepted by the command.
 */
export function Args(...values: IArgument[]): DecoratorProxy {
    return function (target: any) {
        // TODO: It may not be efficient to create a new instance just to extract default properties.
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly args: IArgument[] = [...instance.args, ...values];
        };
    };
}
