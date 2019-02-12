import path from "path";
import {IBotPaths} from "./bot-extra";

export interface IPathResolver {
    command(name: string): string;
    service(name: string): string;
    task(name: string): string;
    language(name: string): string;
}

/**
 * Utility class for resolving paths to the location of common entities.
 */
export default class PathResolver implements IPathResolver {
    public static resolve(...paths: string[]): string {
        return path.resolve(path.join(...paths));
    }

    protected paths: IBotPaths;

    public constructor(paths: IBotPaths) {
        this.paths = paths;
    }

    public command(name: string): string {
        return path.resolve(this.paths.commands, `${name}.js`);
    }

    public service(name: string): string {
        return path.resolve(this.paths.commands, `${name}.js`);
    }

    public task(name: string): string {
        return path.resolve(this.paths.tasks, `${name}.js`);
    }

    public language(name: string): string {
        return PathResolver.resolve(this.paths.languages, `${name}.json`);
    }
}
