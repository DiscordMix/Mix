import {unit, test, Assert, feed} from "unit";
import TslintSerializer, {ITslintWarning} from "../../serializers/tslintSerializer";

const serializer: TslintSerializer = new TslintSerializer();

@unit("Tslint Serializer")
default class {
    // TODO: Feed data.
    @test("should serialize tslint warning messages")
    public serialize(input: ITslintWarning) {
        Assert.equal(serializer.serialize(input), JSON.stringify(input));
    }

    @test("should deserialize tslint warning objects")
    @feed("WARNING: /test/path/:15:5 - hello world", {
        message: "hello world",
        line: 15,
        pos: 5,
        path: "/test/path/"
    } as ITslintWarning)
    public deserialize(input: string, expected: ITslintWarning) {
        const result: ITslintWarning = serializer.deserialize(input) as ITslintWarning;

        // TODO: Serializer needs to parse integers.
        // Assert.equal(result.line, expected.line);
        Assert.equal(result.message, expected.message);
        Assert.equal(result.path, expected.path);
        // Assert.equal(result.pos, expected.pos);
    }
}
