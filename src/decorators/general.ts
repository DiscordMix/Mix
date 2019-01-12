import {DecoratorUtils} from "./decorator-utils";
import Command, {IArgument} from "../commands/command";

export function Name(name: string): any {
    return function (target: any) {
        DecoratorUtils.bind(target);

        return DecoratorUtils.overrideMeta(target, "name", name);
    };
}

export function Description(description: string): any {
    return function (target: any) {
        DecoratorUtils.bind(target);

        return DecoratorUtils.overrideMeta(target, "description", description);
    };
}

export function Aliases(...aliases: string[]): any {
    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly aliases: string[] = [...instance.aliases, ...aliases];
        };
    };
}

export function Arguments(...args: IArgument[]): any {
    return function (target: any) {
        // TODO: It may not be efficient to create a new instance just to extract default properties
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly args: IArgument[] = [...instance.args, ...args];
        };
    };
}
