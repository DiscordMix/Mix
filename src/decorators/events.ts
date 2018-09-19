export const BotEvents: Map<string, any> = new Map();

export function on(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        BotEvents.set(eventName, descriptor.value);
    }
}
