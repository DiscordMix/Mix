import {ISerializer} from "./serializer";
import Patterns from "../core/patterns";

export default class StateSerializer implements ISerializer<boolean, string> {
    public serialize(data: boolean): string {
        return data.toString();
    }
    
    public deserialize(serializedData: string): boolean {
        return Patterns.state.test(serializedData);
    }
}