import {unit, test, feed, Assert, Is, JsType, Does, target} from "unit";
import LogSerializer, {ILogMsg} from "../../serializers/logSerializer";

@unit("Log Serializer")
default class {
    @test("should serialize log messages")
    @target(LogSerializer.prototype.serialize)
    @feed({
        message: "Hello world",
        time: "Today",

        source: {
            main: "World",
            extra: "doe"
        }
    }, "{Today} [World.doe] Hello world")
    @feed({
        message: "{[Hello world]}",
        time: "{Tomorrow}",

        source: {
            main: "It's a",
            extra: "[Doe's world]"
        }
    }, "{{Tomorrow}} [It's a.[Doe's world]] {[Hello world]}")
    public serialize(msg: ILogMsg, expected: string) {
        const serializer: LogSerializer = new LogSerializer();

        Assert.equal(serializer.serialize(msg), expected);
    }

    @test("should not serialize when provided invalid arguments")
    @target(LogSerializer.prototype.serialize)
    @feed(undefined)
    @feed("")
    @feed("hello world")
    @feed(3)
    public serialize_returnNullOnInvalidParams(input: any) {
        const serializer: LogSerializer = new LogSerializer();

        Assert.that(serializer.serialize(input), Is.null);
    }

    @test("should deserialize serialized log messages")
    @target(LogSerializer.prototype.deserialize)
    @feed("{Today} [Some.where] Hello world")
    public deserialize(msg: string) {
        const serializer: LogSerializer = new LogSerializer();
        const result: ILogMsg = serializer.deserialize(msg) as ILogMsg;

        Assert.that(result,
            Is.type(JsType.Object),
            Does.haveProperty("source"),
            Does.haveProperty("message"),
            Does.haveProperty("time")
        );

        Assert.equal(result.message, "Hello world");
        Assert.equal(result.source.main, "Some");
        Assert.equal(result.source.extra, "where");
        Assert.equal(result.time, "Today");
    }

    @test("should deserialize serialized log messages with one source")
    @target(LogSerializer.prototype.deserialize)
    @feed("{Today} [Some] Hello world")
    public deserialize_OneSource(msg: string) {
        const serializer: LogSerializer = new LogSerializer();
        const result: ILogMsg = serializer.deserialize(msg) as ILogMsg;

        Assert.that(result,
            Is.object,
            Does.haveProperty("source"),
            Does.haveProperty("message"),
            Does.haveProperty("time")
        );

        Assert.equal(result.message, "Hello world");
        Assert.equal(result.source.main, "Some");
        Assert.that(result.source.extra, Is.undefined);
        Assert.equal(result.time, "Today");
    }
}
