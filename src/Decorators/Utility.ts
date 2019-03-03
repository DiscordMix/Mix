import "reflect-metadata";

import Log from "../Core/Log";

export interface IBotEvent {
    readonly name: string;
    readonly handler: any;
}

/**
 * Deprecate a function. Will display a warning every time target function is invoked.
 * @param {string | undefined} use The suggested alternative.
 */
export function deprecated(use?: string): any {
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
