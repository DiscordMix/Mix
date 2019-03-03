import {ISerializer} from "./Serializer";
import Pattern from "../core/Pattern";

export interface ITslintWarning {
    readonly path: string;
    readonly message: string;
    readonly line: number;
    readonly pos: number;
}

export default class TslintSerializer implements ISerializer<ITslintWarning> {
    public serialize(data: ITslintWarning): string {
        return JSON.stringify(data);
    }

    // TODO: Needs to parse numbers, (line, pos, etc.).
    public deserialize(data: string): ITslintWarning | null {
        const match: RegExpExecArray | null = Pattern.tslintWarning.exec(data);

        if (match === null || match.groups === undefined) {
            return null;
        }

        return match.groups as any;
    }
}
