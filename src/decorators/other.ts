import Command, {CommandRunner, CommandRelay, IGenericCommand, IConstraints, RestrictGroup} from "../commands/command";
import {DecoratorUtils} from "./decorator-utils";
import Context from "../commands/command-context";
import Log from "../core/log";

export const attachedLogger: CommandRelay = (x: Context, args: any, cmd: IGenericCommand): void => {
    Log.debug(`Command '${cmd.meta.name}' executed | Issued by ${x.sender.tag}`);
};

export function AttachedLogger(...relays: CommandRelay[]): any {
    if (relays.length === 0) {
        relays = [attachedLogger];
        Log.debug("--- INJECTED LOGGER");
    }

    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly connections: CommandRelay[] = [...instance.connections, ...relays];
        };
    };
}

/**
 * Methods that will be executed after successful command execution
 * @param {CommandRelay[]} relays
 * @return {*}
 */
export function Connect(...relays: CommandRelay[]): any {
    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly connections: CommandRelay<void>[] = [...instance.connections, ...relays];
        };
    };
}

/**
 * Specify the required registered services required by this command
 * @param {string[]} services
 * @return {*}
 */
export function DependsOn(...services: string[]): any {
    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly dependsOn: string[] = [...instance.dependsOn, ...services];
        };
    };
}

/**
 * Methods that serve as pre-requisites for execution
 * @param {string[]} guards
 * @return {*}
 */
export function Guards(...guards: string[]): any {
    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly guards: CommandRunner[] = [
                ...instance.guards,
                ...DecoratorUtils.extractMethods(instance, [...guards])
            ];
        };
    };
}

export function OwnerOnly(target: any): any {
    DecoratorUtils.bind(target);

    return class extends target {
        public readonly constraints: IConstraints = {
            ...this.constraints,

            specific: [
                ...this.constraints.specific,
                RestrictGroup.BotOwner
            ]
        };
    };
}
