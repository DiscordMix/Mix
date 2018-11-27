import {ISerializer} from "./serializer";

const logMsgPattern: RegExp = /{([^}]+)} (?:\[([^\]]+)\.([^\]]+)\]|\[([^\]]+)\]) ([\S\s]+)$/gmi;

export type ILogMsg = {
    readonly source: ILogSource;
    readonly message: string;
    readonly time: string;
}

export type ILogSource = {
    readonly main: string;
    readonly extra?: string;
}

// TODO: Add support for custom patterns
/**
 * Serializes log messages from strings into objects and vise versa
 */
export default class LogSerializer implements ISerializer<ILogMsg> {
    public serialize(msg: ILogMsg): string | null {
        if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
            return null;
        }

        return `{${msg.time}} [${msg.source.main ? msg.source.main + "." : ""}${msg.source.extra}] ${msg.message}`;
    }

    public deserialize(msgString: string): ILogMsg | null {
        if (!msgString || typeof msgString !== "string") {
            return null;
        }

        logMsgPattern.lastIndex = 0;

        const match: RegExpExecArray | null = logMsgPattern.exec(msgString);

        if (match === null) {
            return null;
        }

        return {
            time: match[1],
            
            source: {
                main: match[2] || match[4],
                extra: match[3]
            },

            message: match[5]
        };
    }
}