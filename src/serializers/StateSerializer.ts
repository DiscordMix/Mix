import Pattern from "../core/Pattern";
import {ISerializer} from "./Serializer";

namespace Serializers {
    export class StateSerializer implements ISerializer<boolean, string> {
        public serialize(data: boolean): string {
            return data.toString();
        }

        public deserialize(serializedData: string): boolean {
            return Pattern.positiveState.test(serializedData);
        }
    }
}