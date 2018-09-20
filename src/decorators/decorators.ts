import {CommandExecuted, CommandRestrict} from "../commands/command";
import {Argument} from "..";
import {FragmentMeta} from "../fragments/fragment";
import Log from "../core/log";

export const BotEvents: Map<string, any> = new Map();

export const DecoratorCommands: Array<DecoratorCommand> = [];

export function on(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        BotEvents.set(eventName, descriptor.value);
    }
}

export enum DecoratorCommandType {
    Simple,
    Weak
}

export interface DecoratorCommand {
    readonly meta: FragmentMeta;
    readonly type: DecoratorCommandType;
}

export interface WeakCommand extends PartialWeakCommand {
    readonly executed: CommandExecuted;
}

export interface PartialWeakCommand extends DecoratorCommand {
    readonly aliases?: Array<string>;
    readonly restrict?: CommandRestrict;
    readonly arguments?: Array<Argument>;
}

export interface SimpleCommand extends DecoratorCommand {
    readonly executed: CommandExecuted;
}

// options: command name | WeakCommand
export function command(options: string | PartialWeakCommand, description?: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value === undefined) {
            Log.error("[Decorators.command] Expecting value for command decorator");

            return;
        }

        let finalCommand: WeakCommand | SimpleCommand | null = null;
        let type: DecoratorCommandType = DecoratorCommandType.Simple;

        if (typeof options === "string") {
            if (description === undefined) {
                // TODO: Log command name (if it's there)
                Log.error("[Decorators.command] Expecting command description");

                return;
            }

            (finalCommand as any).meta = {
                name: options,
                description: description
            };
        }
        else if (typeof options !== "object") {
            // TODO: Log command name (if it's there)
            Log.error("[Decorators.command] Invalid type of input, expecting either string or object");

            return;
        }
        else if (typeof options === "object" && description !== undefined) {
            // TODO: Log command name (if it's there)
            Log.warn("[Decorators.command] Redundant description value");
        }
        else {
            type = DecoratorCommandType.Weak;
        }

        // Force set the executed method
        finalCommand = Object.assign({}, descriptor.value);
        (finalCommand as any).executed = target;
        (finalCommand as any).type = type;

        // Push for the command store to pickup and register
        DecoratorCommands.push(finalCommand as WeakCommand | SimpleCommand);
    }
}
