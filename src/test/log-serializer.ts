import {expect} from "chai";
import {LogSerializer, ILogMsg} from "..";

describe("Log Serializer", () => {
    describe("serialize()", () => {
        const serializer: LogSerializer = new LogSerializer();

        it("should serialize log messages", () => {
            expect(serializer.serialize({
                message: "Hello world",

                source: {
                    main: "World",
                    extra: "doe"
                },

                time: "Today"
            })).to.be.a("string").and.to.equal("{Today} [World.doe] Hello world");

            expect(serializer.serialize({
                message: "{[Hello world]}",

                source: {
                    main: "It's a",
                    extra: "[Doe's world]"
                },

                time: "{Tomorrow}"
            })).to.be.a("string").and.to.equal("{{Tomorrow}} [It's a.[Doe's world]] {[Hello world]}");
        });

        it("should not serialize when provided invalid arguments", () => {
            expect(serializer.serialize(null as any)).to.be.a("null");
            expect(serializer.serialize(undefined as any)).to.be.a("null");
            expect(serializer.serialize("" as any)).to.be.a("null");
            expect(serializer.serialize("hello world" as any)).to.be.a("null");
            expect(serializer.serialize(3 as any)).to.be.a("null");
        });
    });

    describe("deserialize()", () => {
        const serializer: LogSerializer = new LogSerializer();

        it("should deserialize serialized log messages", () => {
            const result: ILogMsg = serializer.deserialize("{Today} [Some.where] Hello world") as ILogMsg;

            expect(result).to.be.an("object");
            expect(result.message).to.be.a("string").and.to.equal("Hello world");
            expect(result.source).to.be.an("object");
            expect(result.source.main).to.be.an("string").and.to.equal("Some");
            expect(result.source.extra).to.be.an("string").and.to.equal("where");
            expect(result.time).to.be.a("string").and.to.equal("Today");
        });

        it("should deserialize serialized log messages with one source", () => {
            const result: ILogMsg = serializer.deserialize("{Today} [Some] Hello world") as ILogMsg;

            expect(result).to.be.an("object");
            expect(result.message).to.be.a("string").and.to.equal("Hello world");
            expect(result.source).to.be.an("object");
            expect(result.source.main).to.be.an("string").and.to.equal("Some");
            expect(result.source.extra).to.be.a("undefined");
            expect(result.time).to.be.a("string").and.to.equal("Today");
        });
    });
});