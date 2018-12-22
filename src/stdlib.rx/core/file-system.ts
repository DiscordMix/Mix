import fs, {Stats} from "fs";
import {IDisposable} from "./interfaces";

export class FileHandle implements IDisposable {
    public readonly path: Path;

    protected buffer: Buffer | null;

    public constructor(path: string) {
        this.path = new Path(path);

        if (!this.path.exists) {
            throw new Error("Path does not exist");
        }
        else if (this.path.type !== PathType.File) {
            throw new Error("Path must be a file");
        }

        this.buffer = null;
    }

    public async move(destination: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.access(destination, (error: Error) => {
                if (error) {
                    resolve(false);

                    return;
                }

                fs.rename(this.path.value, destination, (error: Error) => {
                    if (error) {
                        resolve(false);

                        return;
                    }

                    resolve(true);
                });
            });
        });
    }

    public moveSync(destination: string): boolean {
        try {
            fs.accessSync(destination, fs.constants.R_OK | fs.constants.W_OK);
            fs.renameSync(this.path.value, destination);

            return true;
        }
        catch (error) {
            return false;
        }
    }

    public async readAll(): Promise<Buffer> {
        if (this.buffer !== null) {
            return this.buffer;
        }

        return new Promise((resolve, reject) => {
            fs.readFile(this.path.value, (error: Error, data: Buffer) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve(data);
            });
        });
    }

    public async readAllAsString(): Promise<string> {
        return (await this.readAll()).toString();
    }

    public async readAllAsJson<T extends object>(): Promise<T> {
        return JSON.parse(await this.readAllAsString());
    }

    public async load(): Promise<Buffer> {
        this.buffer = await this.readAll();

        return this.buffer;
    }

    public reload(): Promise<Buffer> {
        return this.load();
    }

    public async unload(): Promise<this> {
        if (this.buffer !== null) {
            this.buffer = null;
        }

        return this;
    }

    public get loaded(): boolean {
        return this.buffer !== null;
    }

    public get exists(): boolean {
        return this.path.exists;
    }

    public dispose(): void {
        this.unload();
    }
}

export interface IPathInfo {
    readonly root: string;
    readonly fileName: string;
    readonly fileExtension: string;
    readonly fullFileName: string;
}

enum PathType {
    File,
    Directory,
    Other
}

export class Path {
    public readonly info: IPathInfo;
    public readonly value: string;

    protected typeCache: PathType | null;

    public constructor(pathStr: string) {
        this.value = pathStr;
        this.info = Path.parse(pathStr);
        this.typeCache = null;
    }

    public get exists(): boolean {
        return fs.existsSync(this.value);
    }

    public get type(): PathType {
        if (this.typeCache !== null) {
            return this.typeCache;
        }

        const stats: Stats = fs.lstatSync(this.value);

        if (stats.isDirectory()) {
            return PathType.Directory;
        }
        else if (stats.isFile()) {
            return PathType.File;
        }

        return PathType.Other;
    }

    public static parse(pathStr: string): IPathInfo {
        // TODO
        throw new Error("Not yet implemented");
    }
}