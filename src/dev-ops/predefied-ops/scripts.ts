import {exec, execSync} from "child_process";

export default abstract class ScriptOperations {
    public execute(base: string, ...args: string[]): Promise<boolean> {
        return new Promise((resolve) => {
            exec(`${base} ${args.join(" ")}`.trim(), (error: Error | null) => {
                if (error) {
                    resolve(false);

                    return;
                }

                resolve(true);
            });
        });
    }

    public executeSync(base: string, ...args: string[]): boolean {
        try {
            execSync(`${base} ${args.join(" ")}`.trim());

            return true;
        }
        catch {
            return false;
        }
    }

    // TODO: Implement
    public npm(name: string): boolean {
        throw new Error("Not yet implemented");
    }
}