import Command, {CommandRunner, CommandRelay, IGenericCommand} from "../commands/command";
import {DecoratorUtils} from "./decorator-utils";
import Context from "../commands/command-context";
import Log from "../core/log";
import DiscordEvent from "../core/discord-event";

export const attachedLogger: CommandRelay = ($: Context, args: any, cmd: IGenericCommand): void => {
    Log.debug(`Command '${cmd.meta.name}' executed | Issued by ${$.sender.tag}`);
};

export function AttachedLogger(...relays: CommandRelay[]): any {
    if (relays.length === 0) {
        relays = [attachedLogger];
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
export function Guard(...guards: string[]): any {
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

export function OnEvent(event: DiscordEvent): any {
    return function () {
        // TODO: Implement
    };
}
