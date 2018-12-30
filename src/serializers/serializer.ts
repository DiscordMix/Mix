/**
 * Allows conversion between two different data types
 */
export interface ISerializer<TData, TOutput = string> {
    serialize(data: TData): TOutput | null;
    deserialize(serializedData: TOutput): TData | null;
}