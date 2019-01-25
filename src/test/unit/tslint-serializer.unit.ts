import {Unit, Test, Assert, Feed} from "unit";
import TslintSerializer, {ITslintWarning} from "../../serializers/tslint-serializer";

const serializer: TslintSerializer = new TslintSerializer();

@Unit("Tslint Serializer")
default class {
    @Test("should serialize tslint warning messages")
    public serialize(input: ITslintWarning): void {
        Assert.equal(serializer.serialize(input), JSON.stringify(input));
    }

    @Test("should deserialize tslint warning objects")
    @Feed("WARNING: /test/path/:15:5 - hello world", {
        message: "hello world",
        line: 15,
        pos: 5,
        path: "/test/path/"
    } as ITslintWarning)
    public deserialize(input: string, expected: ITslintWarning): void {
        throw new Error("Testing an error intentionally thrown");
        Assert.equal(serializer.deserialize(input), expected);
    }
}
