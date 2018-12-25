import fs from "fs";
import rimraf = require("rimraf");
import {execFile, execFileSync} from "child_process";

export default abstract class FileSystemOperations {
    public moveSync(from: string, to: string): boolean {
        try {
            fs.renameSync(from, to);

            return true;
        }
        catch {
            return false;
        }
    }

    public move(from: string, to: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.rename(from, to, (error: Error) => {
                if (error) {
                    resolve(false);

                    return;
                }

                resolve(true);
            });
        });
    }

    public removeSync(path: string): boolean {
        try {
            fs.unlinkSync(path);
            return true;
        }
        catch {
            return false;
        }
    }

    public remove(path: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.unlink(path, (error: Error) => {
                if (error) {
                    resolve(false);

                    return;
                }

                resolve(true);
            });
        });
    }

    public forceRemove(path: string): Promise<boolean> {
        return new Promise((resolve) => {
            rimraf(path, (error: Error) => {
                if (error) {
                    resolve(false);

                    return;
                }

                resolve(true);
            });
        });
    }

    public forceRemoveSync(path: string): boolean {
        try {
            rimraf.sync(path);

            return true;
        }
        catch {
            return false;
        }
    }

    public run(path: string): Promise<boolean> {
        return new Promise((resolve) => {
            execFile(path, (error: Error | null) => {
                if (error) {
                    resolve(false);

                    return;
                }

                resolve(true);
            });
        });
    }

    public runSync(path: string): boolean {
        try {
            execFileSync(path);

            return true;
        }
        catch {
            return false;
        }
    }
}