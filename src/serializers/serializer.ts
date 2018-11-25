export type ISerializer<DataType, OutputType = string> = {
    serialize(data: DataType): OutputType | null;
    
    deserialize(serializedData: OutputType): DataType | null;
}