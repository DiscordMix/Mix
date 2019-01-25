import {ISerializer} from "./serializer";
import Pattern from "../core/pattern";

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

    public deserialize(data: string): ITslintWarning | null {
        const match: RegExpExecArray | null = Pattern.tslintWarning.exec(data);

        // TODO
        console.log("Groups are:", match !== null ? match.groups : "<null>");

        if (match === null || match.groups === undefined) {
            return null;
        }

        return match.groups as any;
    }
}
