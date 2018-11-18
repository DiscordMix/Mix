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