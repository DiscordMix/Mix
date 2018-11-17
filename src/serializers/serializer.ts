import {Log} from "..";

export type ISerializer<DataType> = {
    serialize(data: DataType): string | null;
    deserialize(serializedData: string): DataType | null;
}

// TODO: Move out of this file
export type ILogSource = {
    readonly main: string;
    readonly extra?: string;
}

export type ILogMsg = {
    readonly source: ILogSource;
    readonly message: string;
    readonly time: string;
}

// TODO: Add support for custom patterns
export class LogSerializer implements ISerializer<ILogMsg> {
    public serialize(msg: ILogMsg): string | null {
        return `{${msg.time}} [${msg.source.main ? msg.source.main + "." : ""}${msg.source.extra}] ${msg.message}`;
    }

    public deserialize(msgString: string): ILogMsg | null {
        const match: RegExpExecArray | null = /{([^}]+)} (?:\[([^\]]+)\.([^\]]+)\]|\[([^\]]+)\]) ([\S\s]+)$/gmi.exec(msgString);

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