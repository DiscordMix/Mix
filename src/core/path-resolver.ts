import path from "path";
import {ISettingsPaths} from "./settings";

export default class PathResolver {
    protected paths: ISettingsPaths;

    public constructor(paths: ISettingsPaths) {
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

    public static resolve(...paths: string[]): string {
        return path.resolve(path.join(...paths));
    }
}