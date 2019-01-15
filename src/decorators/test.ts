import {DecoratorUtils} from "./decorator-utils";
import Probe from "../probe/probe";

export function Test(description?: string): any {
    return function (target: any, prop: any) {
        const method: any = target[prop];

        DecoratorUtils.ensureFunc(method);

        // Use function name if no name is provided
        if (description === undefined) {
            description = method.name;
        }

        // Mark function as a test
        method.$$test = description;
    }
}

export function Unit(name?: string): any {
    return function (target: any) {
        //DecoratorUtils.ensureObj(target);

        if (name === undefined) {
            name = target.name;
        }

        Probe.createUnit(name as string, target);

        // Find tests
        for (const prop of Object.getOwnPropertyNames(target.prototype)) {
            const method: any = target.prototype[prop];

            if (typeof method !== "function") {
                continue;
            }
            else if (typeof method.$$test === "string") {
                Probe.createTest(method.$$test, name as string, method);
            }
        }
    }
}
