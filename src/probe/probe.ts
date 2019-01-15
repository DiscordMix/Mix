import {Collection} from "../collections/collection";
import colors from "colors";
import Log from "../core/log";

export interface ITest {
    readonly description: string;
    readonly invoke: () => void;
}

export interface IUnit<T = any> {
    readonly name: string;
    readonly instance: T;
    readonly tests: ITest[];
}

export default abstract class Probe {
    protected static units: Collection<string, IUnit> = new Collection();

    public static run(): void {
        for (const unit of Probe.units.array()) {
            Probe.processUnit(unit);

            for (const test of unit.tests) {
                Probe.processTest(test);
            }
        }
    }

    public static clear(): void {
        Probe.units.clear();
    }

    public static createTest(description: string, unitName: string, instance: any): void {
        if (Probe.units.has(unitName)) {
            const unit: IUnit = Probe.units.get(unitName) as IUnit;

            unit.tests.push({
                description,
                invoke: instance
            });

            return;
        }

        throw Log.error(`Cannot create test | Unit '${unitName}' does not exist`);
    }

    public static createUnit<T = any>(name: string, instance: T): void {
        Probe.units.set(name, {
            instance,
            name,
            tests: []
        });
    }

    protected static processUnit(unit: IUnit): void {
        console.log(`  [${unit.name}]`);
    }

    // TODO: Use depth
    protected static async processTest(test: ITest, depth: number = 0): Promise<void> {
        let resultError: Error | null = null;

        try {
            const result: any = test.invoke();

            if (result instanceof Promise) {
                result.catch((error: Error) => {
                    resultError = error;
                });

                await result;
            }
        }
        catch (error) {
            resultError = error;
        }

        const desc: string = colors.gray(test.description);
        const check: string = colors.green("√");
        const fail: string = colors.red("X");

        if (resultError === null) {
            console.log(`    ${check} ${desc}`);
        }
        else {
            console.log(`    ${fail} ${desc}`);
        }
    }
}
