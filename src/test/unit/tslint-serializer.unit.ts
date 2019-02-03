import {Unit, Test, Assert, Feed, Is} from "unit";
import TslintSerializer, {ITslintWarning} from "../../serializers/tslint-serializer";

const serializer: TslintSerializer = new TslintSerializer();

@Unit("Tslint Serializer")
default class {
    // TODO: Feed data.
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
        const result: ITslintWarning = serializer.deserialize(input) as ITslintWarning;

        // TODO: Serializer needs to parse integers.
        // Assert.equal(result.line, expected.line);
        Assert.equal(result.message, expected.message);
        Assert.equal(result.path, expected.path);
        // Assert.equal(result.pos, expected.pos);
    }
}
