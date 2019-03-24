import {Unit, Test, Feed, Assert, Is, JsType, Does, Target} from "unit";
import LogSerializer, {ILogMsg} from "../../serializers/logSerializer";

@Unit("Log Serializer")
default class {
    @Test("Should serialize log messages")
    @Target(LogSerializer.prototype.serialize)
    @Feed({
        message: "Hello world",
        time: "Today",

        source: {
            main: "World",
            extra: "doe"
        }
    }, "{Today} [World.doe] Hello world")
    @Feed({
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

    @Test("Should not serialize when provided invalid arguments")
    @Target(LogSerializer.prototype.serialize)
    @Feed(undefined)
    @Feed("")
    @Feed("hello world")
    @Feed(3)
    public serialize_returnNullOnInvalidParams(input: any) {
        const serializer: LogSerializer = new LogSerializer();

        Assert.that(serializer.serialize(input), Is.null);
    }

    @Test("Should deserialize serialized log messages")
    @Target(LogSerializer.prototype.deserialize)
    @Feed("{Today} [Some.where] Hello world")
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

    @Test("Should deserialize serialized log messages with one source")
    @Target(LogSerializer.prototype.deserialize)
    @Feed("{Today} [Some] Hello world")
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
