import LogLevel from "./log-level";

export default interface IComposeOptions {
    readonly message: any;
    readonly params: any[];
    readonly level: LogLevel;
    readonly color?: string;
    readonly prefix?: string;
}
