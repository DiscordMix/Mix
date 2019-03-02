import Command, {IConstraints} from "../commands/Command";
import Log from "../core/Log";

namespace Decorators {
    /**
     * Static utility class for decorators.
     */
    export abstract class DecoratorUtils {
        // TODO: Attempt to merge override methods.
        // TODO: Should append instead of override?
        public static overrideConstraint(target: any, constraint: string, value: any): DecoratorProxy {
            return class extends target {
                public readonly constraints: IConstraints = {
                    ...this.constraints,
                    [constraint]: value
                };
            };
        }

        public static overrideMeta(target: any, meta: string, value: any): DecoratorProxy {
            return class extends target {
                public readonly meta: Fragments.IMeta = {
                    ...this.meta,
                    [meta]: value
                };
            };
        }

        /**
         * Ensure input is a function, otherwise throw an error.
         */
        public static ensureFunc(target: any): void {
            if (typeof target !== "function") {
                throw Log.error("Expecting target to be a function");
            }
        }

        /**
         * Ensure input is an object, otherwise throw an error.
         */
        public static ensureObj(target: any): void {
            if (typeof target !== "object") {
                throw Log.error("Expecting target to be an object");
            }
        }

        /**
         * Extract all methods from a class into an array.
         */
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

        /**
         * Ensure input is a function and create an instance of it.
         */
        public static createInstance<T = Command>(target: any): T {
            DecoratorUtils.ensureFunc(target);

            return new target();
        }
    }
}
