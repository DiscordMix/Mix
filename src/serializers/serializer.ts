/**
 * Allows conversion between two different data types
 */
export interface ISerializer<DataType, OutputType = string> {
    serialize(data: DataType): OutputType | null;
    deserialize(serializedData: OutputType): DataType | null;
}