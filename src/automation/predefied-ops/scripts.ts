import {exec, execSync} from "child_process";

export default abstract class ScriptOperations {
    public static execute(base: string, ...args: string[]): Promise<boolean> {
        return new Promise((resolve) => {
            exec(`${base} ${args.join(" ")}`.trim(), (error: Error | null) => {
                if (error !== null) {
                    resolve(false);

                    return;
                }

                resolve(true);
            });
        });
    }

    public static executeSync(base: string, ...args: string[]): boolean {
        try {
            execSync(`${base} ${args.join(" ")}`.trim());

            return true;
        }
        catch {
            return false;
        }
    }

    public static npm(name: string): Promise<boolean> {
        return ScriptOperations.execute("npm", "run-script", name);
    }

    public static npmSync(name: string): boolean {
        return ScriptOperations.executeSync("npm", "run-script", name);
    }

    public static npmStart(): Promise<boolean> {
        return ScriptOperations.execute("npm", "start");
    }

    public static npmTest(): Promise<boolean> {
        return ScriptOperations.execute("npm", "test");
    }

    public static npmTestSync(): boolean {
        return ScriptOperations.executeSync("npm", "test");
    }

    public static npmBuild(): Promise<boolean> {
        return ScriptOperations.npm("build");
    }

    public static npmBuildSync(): boolean {
        return ScriptOperations.npmSync("build");
    }

    public static npmInstall(): Promise<boolean> {
        return ScriptOperations.execute("npm", "install");
    }

    public static npmInstallSync(): boolean {
        return ScriptOperations.executeSync("npm", "install");
    }
}