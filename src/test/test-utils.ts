import Log from "../core/log";

export enum ExcludeParam {
    Object,
    Array,
    Method,
    Number
}

const ComplexTypes: string[] = [
    "function",
    "object",
    "number"
];

export default abstract class TestUtils {
    public static randomString(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public static randomStringX(length: number): string {
        if (length < 1) {
            throw Log.error("Expecting length to be a number higher than 0");
        }

        let finalString: string = "";

        for (let i: number = 0; i < length; i++) {
            finalString += TestUtils.randomString();
        }

        return finalString;
    }

    // TODO: Make use of the paramAmount argument
    public static makeParams(exclude?: any[], paramAmount: number = 1): any[] {
        const params: any[] = [
            [],
            {},
            0,
            1,
            null,
            undefined,
            false,
            true,
            "test",
            "",

            // TODO.
            // (): void => {}
        ];

        if (exclude !== undefined) {
            for (const item of exclude) {
                if (!ComplexTypes.includes(typeof item) && !Array.isArray(item) && params.includes(item)) {
                    params.splice(params.indexOf(item), 1);
                }
                else if (typeof item === "number") {
                    switch (item) {
                        case ExcludeParam.Array: {
                            // Remove 'Array'.
                            params.splice(0, 1);

                            break;
                        }

                        case ExcludeParam.Object: {
                            // Remove 'Object'.
                            params.splice(1, 1);

                            break;
                        }

                        case ExcludeParam.Method: {
                            throw Log.notImplemented;
                        }

                        case ExcludeParam.Number: {
                            // Remove 'Numbers'.
                            params.splice(2, 2);

                            break;
                        }

                        default: {
                            throw Log.error("Unknown exclude parameter");
                        }
                    }
                }
                else {
                    throw Log.error("Invalid type of item in the exclude array");
                }
            }
        }

        return params;
    }
}
