import {CommandRestrict} from "../commands/command";
import {Argument} from "..";

export const BotEvents: Map<string, any> = new Map();

export const DecoratorCommands: Map<string | WeakCommand, any> = new Map();

export function on(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        BotEvents.set(eventName, descriptor.value);
    }
}

export type WeakCommand = {
    readonly name: string;
    readonly description: string;
    readonly aliases?: Array<string>;
    readonly restrict?: CommandRestrict;
    readonly arguments?: Array<Argument>;
};

// options: command name | WeakCommand
export function command(options: string | WeakCommand) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        DecoratorCommands.set(name, descriptor.value);
    }
}
