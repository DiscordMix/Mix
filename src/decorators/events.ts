export function on(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("on: ", target, " : ", propertyKey, " : ", descriptor);
    }
}
