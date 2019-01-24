import {Unit, Test, Feed, Assert, Is, JsType, Does} from "unit";
import LogSerializer, {ILogMsg} from "../../serializers/log-serializer";

@Unit("Log Serializer")
default class {
    @Test("should serialize log messages")
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
    public serialize(msg: ILogMsg, expected: string): void {
        const serializer: LogSerializer = new LogSerializer();

        Assert.equal(serializer.serialize(msg), expected);
    }

    @Test("should deserialize serialized log messages")
    @Feed("{Today} [Some.where] Hello world")
    public deserialize(msg: string): void {
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

    @Test("should deserialize serialized log messages with one source")
    @Feed("{Today} [Some] Hello world")
    public deserializeOneSource(msg: string): void {
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
