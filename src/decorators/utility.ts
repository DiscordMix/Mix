import "reflect-metadata";

import Log from "../core/log";
import {DecoratorUtils} from "./decorator-utils";

export interface IBotEvent {
    readonly name: string;
    readonly handler: any;
}

export function Deprecated(use?: string): any {
    return function (target: any) {
        const functionName: string = Object.keys(target)[0];
        const className: string = target.constructor.name;

        let notice: string = `Function '${className}.${functionName}' is deprecated and may be removed in the future.`;

        if (use !== undefined) {
            notice += ` Use ${use} instead.`;
        }

        Log.warn(notice);
    };
}
