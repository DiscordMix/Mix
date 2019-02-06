import DiscordEvent from "../core/discord-event";
import {DecoratorUtils} from "./decorator-utils";
import {DecoratorProxy} from "./component";

export enum EventListenerType {
    Once,
    On
}

export interface IEventListener {
    readonly type: EventListenerType;
    readonly event: DiscordEvent;

    invoker(...args: any): void;
}

export const EventListeners: IEventListener[] = [];

/**
 * Invoke target method once when the specified event occurs.
 * @param {DiscordEvent} event
 */
export function once(event: DiscordEvent): DecoratorProxy {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        EventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}

/**
 * Invoke target method every time the specified event occurs.
 * @param {DiscordEvent} event
 */
export function on(event: DiscordEvent): DecoratorProxy {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        EventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}
