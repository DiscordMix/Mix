export type ISerializer<DataType> = {
    serialize(data: DataType): string | null;
    
    deserialize(serializedData: string): DataType | null;
}