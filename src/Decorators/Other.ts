import Command, {CommandRunner, CommandRelay, IGenericCommand} from "../Commands/Command";
import {DecoratorUtils} from "./DecoratorUtils";
import Context from "../Commands/Context";
import Log from "../Core/Log";

export const AttachedLoggerFn: CommandRelay = ($: Context, args: any, cmd: IGenericCommand): void => {
    Log.debug(`Command '${cmd.meta.name}' executed | Issued by ${$.sender.tag}`);
};

/**
 * Attach an execution logger for debugging purposes.
 */
export function AttachedLogger(...relays: CommandRelay[]): any {
    if (relays.length === 0) {
        relays = [AttachedLoggerFn];
    }

    return function (target: any) {
        const instance: Command = DecoratorUtils.createInstance(target);

        return class extends target {
            public readonly connections: CommandRelay[] = [...instance.connections, ...relays];
        };
    };
}

/**
 * Methods that will be executed after successful command execution.
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
 * Specify the required registered services required by this command.
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
 * Methods that serve as pre-requisites for execution.
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

/**
 * Informs the user that the requested command is not yet implemented. The run method will not be executed.
 */
export function NotImplemented(): any {
    return function (target: any) {
        return class extends target {
            public async run($: Context) {
                await $.send("Requested functionality is not yet implemented.");
            }
        };
    };
}
