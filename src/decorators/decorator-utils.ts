import Command, {IConstraints} from "../commands/command";
import {IFragmentMeta} from "../fragments/fragment";
import Log from "../core/log";

export abstract class DecoratorUtils {
    // TODO: Attempt to merge override methods
    // TODO: Should append instead of override?
    public static overrideConstraint(target: any, constraint: string, value: any): any {
        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,
                [constraint]: value
            };
        };
    }

    public static overrideMeta(target: any, meta: string, value: any): any {
        return class extends target {
            public readonly meta: IFragmentMeta = {
                ...this.meta,
                [meta]: value
            };
        };
    }

    public static ensure(target: any): void {
        if (typeof target !== "function") {
            throw Log.error("Expecting target to be a class");
        }
    }

    public static extractMethods<T = any>(source: any, keys: string[]): T[] {
        const result: T[] = [];

        for (const key of keys) {
            if (typeof source[key] !== "function") {
                throw Log.error("Expecting source's property to be a method");
            }

            result.push(source[key]);
        }

        return result;
    }

    public static createInstance<T = Command>(target: any): T {
        DecoratorUtils.ensure(target);

        return new target();
    }
}
