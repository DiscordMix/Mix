import Util, {IBinarySearchResult} from "../core/util";
import {expect, assert} from "chai";
import {TestSubjects} from "./test-bot";

describe("Util", () => {
    describe("isEmpty()", () => {
        it("should return whether the input is empty", () => {
            expect(Util.isEmpty("")).to.equal(true);
            expect(Util.isEmpty(undefined)).to.equal(true);
            expect(Util.isEmpty("     ")).to.equal(true);
            expect(Util.isEmpty("   hello world   ")).to.equal(false);
            expect(Util.isEmpty(null)).to.equal(true);
            expect(Util.isEmpty(0)).to.equal(false);
            expect(Util.isEmpty(false)).to.equal(false);
            expect(Util.isEmpty([])).to.equal(true);
            expect(Util.isEmpty(["hello"])).to.equal(false);
        });
    });

    describe("hasMentionPrefix()", () => {
        it("should return whether the text provided start with a mention", () => {
            expect(Util.hasMentionPrefix(`<@${TestSubjects.ids[0]}> hello world`, TestSubjects.ids[0])).to.equal(true);
            expect(Util.hasMentionPrefix(`hello world <@${TestSubjects.ids[0]}>`, TestSubjects.ids[0])).to.equal(false);
        });

        it("should throw an error when provided invalid input", () => {
            assert.throws(() => Util.hasMentionPrefix(undefined as any, undefined as any));
            assert.throws(() => Util.hasMentionPrefix(null as any, null as any));
            assert.throws(() => Util.hasMentionPrefix(4 as any, 543 as any));
            assert.throws(() => Util.hasMentionPrefix({} as any, "hello world"));
        });
    });

    describe("escapeText()", () => {
        it("should escape tokens", () => {
            expect(Util.escapeText(TestSubjects.token, TestSubjects.token)).to.equal("[Token]");
            expect(Util.escapeText("hi world, hello world, john doe", "hello world")).to.equal("hi world, [Token], john doe");
            expect(Util.escapeText(`hi world, ${TestSubjects.token}, john doe`, "hello world")).to.equal("hi world, [Token], john doe");
            expect(Util.escapeText(`hi world, ${TestSubjects.token}, john doe, hello world, hi`, "hello world")).to.equal("hi world, [Token], john doe, [Token], hi");
        });

        it("should escape IPv4s", () => {
            expect(Util.escapeText("192.168.0.1", "empty")).to.equal("[IPv4]");
            expect(Util.escapeText("53.32.53.252", "empty")).to.equal("[IPv4]");
            expect(Util.escapeText("hello 192.168.0.1 world", "empty")).to.equal("hello [IPv4] world");
        });

        it("should escape mentions", () => {
            expect(Util.escapeText("@everyone hello world", "empty")).to.equal("[Mention] hello world");
            expect(Util.escapeText("hello @everyone world", "empty")).to.equal("hello [Mention] world");
            expect(Util.escapeText("@here hello world", "empty")).to.equal("[Mention] hello world");
            expect(Util.escapeText("hello @here world", "empty")).to.equal("hello [Mention] world");
            expect(Util.escapeText("hello @here world @everyone john", "empty")).to.equal("hello [Mention] world [Mention] john");
            expect(Util.escapeText("@herehello @here world@everyonejohn", "empty")).to.equal("[Mention]hello [Mention] world[Mention]john");
            expect(Util.escapeText(`hello ${TestSubjects.ids[0]} world`, "empty")).to.equal("hello [Mention] world");
            expect(Util.escapeText(`hello ${TestSubjects.ids[1]} world`, "empty")).to.equal("hello [Mention] world");
            expect(Util.escapeText(`hello ${TestSubjects.ids[2]} world`, "empty")).to.equal("hello [Mention] world");
            expect(Util.escapeText(`hello ${TestSubjects.ids[3]} world`, "empty")).to.equal(`hello ${TestSubjects.ids[3]} world`);
        });

        it("should throw when provided invalid input", () => {
            assert.throws(() => Util.escapeText(undefined as any, undefined as any));
            assert.throws(() => Util.escapeText(null as any, null as any));
            assert.throws(() => Util.escapeText(undefined as any, null as any));
            assert.throws(() => Util.escapeText(null as any, undefined as any));
            assert.throws(() => Util.escapeText({} as any, 465 as any));
            assert.throws(() => Util.escapeText(52 as any, {} as any));
        });
    });

    describe("resolveId()", () => {
        it("should return the resolved ids", () => {
            // TODO: Review?
            for (let i: number = 0; i < TestSubjects.ids.length; i++) {
                const result: any = Util.resolveId(TestSubjects.ids[i]);

                expect(result).to.be.an("string");
                expect(result).to.have.lengthOf(18);
            }
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.resolveId(undefined as any));
            assert.throws(() => Util.resolveId(1 as any));
            assert.throws(() => Util.resolveId(0 as any));
            assert.throws(() => Util.resolveId(false as any));
            assert.throws(() => Util.resolveId(true as any));
            assert.throws(() => Util.resolveId({} as any));
            assert.throws(() => Util.resolveId([] as any));
        });
    });

    describe("timeAgo()", () => {
        it("should return a string", () => {
            expect(Util.timeAgo(Date.now())).to.be.an("string");
        });
    });

    describe("getRandomInt()", () => {
        it("should return a random number", () => {
            const result: number | null = Util.getRandomInt(0, 2);

            expect(result).to.be.an("number");
            expect([0, 1]).to.include(result as number);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.getRandomInt(0, 0));
            assert.throws(() => Util.getRandomInt(0, -1));
            assert.throws(() => Util.getRandomInt(50, 10));
            assert.throws(() => Util.getRandomInt("hello" as any, 3));
            assert.throws(() => Util.getRandomInt("" as any, 3));
            assert.throws(() => Util.getRandomInt(3, "hello" as any));
            assert.throws(() => Util.getRandomInt(3, "" as any));
            assert.throws(() => Util.getRandomInt(undefined as any, 3));
            assert.throws(() => Util.getRandomInt(3 as any, undefined as any));
            assert.throws(() => Util.getRandomInt(null as any, 3));
            assert.throws(() => Util.getRandomInt(3, null as any));
            assert.throws(() => Util.getRandomInt({} as any, 3));
            assert.throws(() => Util.getRandomInt(3, {} as any));
        });
    });

    describe("translateState()", () => {
        it("should return the translated state", () => {
            const subjects: any[] = [
                true,
                1,
                "y",
                "yes",
                "on"
            ];

            for (let i: number = 0; i < subjects.length; i++) {
                expect(Util.translateState(subjects[i].toString())).to.be.an("boolean").and.to.equal(true);
            }
        });
    });

    describe("timeFromNow()", () => {
        it("should return the time from now in milliseconds", () => {
            const result = Util.timeFromNow(0, 0, 50);

            expect(result).to.be.an("number");
            expect(result.toString()).to.have.lengthOf(13);
        });
    });

    describe("shuffle()", () => {
        it("should shuffle an array", () => {
            expect(Util.shuffle(["hello", "my", "name", "is", "john doe"])).to.be.an("array").and.to.have.length(5);
            expect(Util.shuffle([])).to.be.an("array").and.to.have.length(0);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.shuffle(undefined as any))
            assert.throws(() => Util.shuffle(null as any));
            assert.throws(() => Util.shuffle("" as any));
            assert.throws(() => Util.shuffle("hello world" as any));
            assert.throws(() => Util.shuffle(1 as any));
            assert.throws(() => Util.shuffle(0 as any));
            assert.throws(() => Util.shuffle({} as any));
            assert.throws(() => Util.shuffle(false as any));
            assert.throws(() => Util.shuffle(true as any));
        });
    });

    describe("getUserIdentifier()", () => {
        it("should return a valid user identifier", () => {
            const result1: string = Util.getUserIdentifier({
                id: TestSubjects.ids[3],
                tag: "JohnDoe#1234"
            } as any);

            expect(result1).to.equal(`<@${TestSubjects.ids[3]}> (JohnDoe#1234:${TestSubjects.ids[3]})`);
        });

        it("should throw when provided invalid input", () => {
            assert.throws(() => Util.getUserIdentifier("" as any));
            assert.throws(() => Util.getUserIdentifier("hello world" as any));
            assert.throws(() => Util.getUserIdentifier(123 as any));
            assert.throws(() => Util.getUserIdentifier({} as any));
        });
    });

    const populated: number[] = Util.populate(50);

    describe("populate()", () => {
        it("should populate an array", () => {
            expect(populated).to.be.an("array").and.to.have.length(50);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.populate(undefined as any));
            assert.throws(() => Util.populate(null as any));
            assert.throws(() => Util.populate([] as any));
            assert.throws(() => Util.populate({} as any));
            assert.throws(() => Util.populate(false as any));
            assert.throws(() => Util.populate(true as any));
            assert.throws(() => Util.populate("test" as any));
            assert.throws(() => Util.populate("" as any));
        });
    });

    describe("binarySearch()", () => {
        it("should find an existing item", () => {
            const result: IBinarySearchResult = Util.binarySearch(3, populated);

            expect(result).to.be.an("object");
            expect(result.found).to.be.a("boolean").and.to.equal(true);
            expect(result.iterations).to.be.a("number").and.to.equal(6);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.binarySearch(undefined as any, []));
            assert.throws(() => Util.binarySearch(false as any, []));
            assert.throws(() => Util.binarySearch(true as any, []));
            assert.throws(() => Util.binarySearch([] as any, []));
            assert.throws(() => Util.binarySearch({} as any, []));
            assert.throws(() => Util.binarySearch(null as any, []));
            assert.throws(() => Util.binarySearch("test" as any, []));
            assert.throws(() => Util.binarySearch("" as any, []));
        });
    });

    describe("binaryInsert()", () => {
        it("should determine an index to insert", () => {
            populated.splice(5, 1);

            const index: number = Util.binaryInsert(5, populated);

            expect(index).to.be.a("number").and.to.equal(4);

            populated.splice(index + 1, 0, 5);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.binaryInsert(undefined as any, []));
            assert.throws(() => Util.binaryInsert(null as any, []));
            assert.throws(() => Util.binaryInsert(false as any, []));
            assert.throws(() => Util.binaryInsert(true as any, []));
            assert.throws(() => Util.binaryInsert("hello" as any, []));
            assert.throws(() => Util.binaryInsert("" as any, []));
            assert.throws(() => Util.binaryInsert({} as any, []));
            assert.throws(() => Util.binaryInsert([] as any, []));

            assert.throws(() => Util.binaryInsert(undefined as any, null as any));
            assert.throws(() => Util.binaryInsert(undefined as any, undefined as any));
            assert.throws(() => Util.binaryInsert(undefined as any, false as any));
            assert.throws(() => Util.binaryInsert(undefined as any, true as any));
            assert.throws(() => Util.binaryInsert(undefined as any, "hello" as any));
            assert.throws(() => Util.binaryInsert(undefined as any, "" as any));
            assert.throws(() => Util.binaryInsert(undefined as any, {} as any));
            assert.throws(() => Util.binaryInsert(undefined as any, [] as any));
            assert.throws(() => Util.binaryInsert(undefined as any, 1 as any));
            assert.throws(() => Util.binaryInsert(undefined as any, 0 as any));

            assert.throws(() => Util.binaryInsert(1, 1 as any));
            assert.throws(() => Util.binaryInsert(1, 0 as any));
            assert.throws(() => Util.binaryInsert(1, {} as any));
            assert.throws(() => Util.binaryInsert(1, null as any));
            assert.throws(() => Util.binaryInsert(1, undefined as any));
            assert.throws(() => Util.binaryInsert(1, "hello" as any));
            assert.throws(() => Util.binaryInsert(1, "" as any));
            assert.throws(() => Util.binaryInsert(1, true as any));
            assert.throws(() => Util.binaryInsert(1, false as any));
        });
    });

    describe("spreadTime()", () => {
        it("should return spread time", () => {
            expect(Util.spreadTime(1000)).to.be.a("string").and.to.equal("1 000");
            expect(Util.spreadTime(10_000)).to.be.a("string").and.to.equal("10 000");
            expect(Util.spreadTime(531_352)).to.be.a("string").and.to.equal("531 352");
            expect(Util.spreadTime(1)).to.be.a("string").and.to.equal("1");
            expect(Util.spreadTime(10)).to.be.a("string").and.to.equal("10");
            // expect(Utils.spreadTime(-15_050_050)).to.be.a("string").and.to.equal("-15 050 050"); // TODO: Not working
            expect(Util.spreadTime(-+-15)).to.be.a("string").and.to.equal("15");
        });

        it("should use delimiters", () => {
            expect(Util.spreadTime(1000, ",")).to.be.a("string").and.to.equal("1,000");
            expect(Util.spreadTime(1, ",")).to.be.a("string").and.to.equal("1");
            expect(Util.spreadTime(100_000, ",")).to.be.a("string").and.to.equal("100,000");
            expect(Util.spreadTime(-1000, ",")).to.be.a("string").and.to.equal("-1,000");
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Util.spreadTime("hello" as any));
            assert.throws(() => Util.spreadTime("" as any));
            assert.throws(() => Util.spreadTime(undefined as any));
            assert.throws(() => Util.spreadTime(null as any));
            assert.throws(() => Util.spreadTime([] as any));
            assert.throws(() => Util.spreadTime({} as any));
            assert.throws(() => Util.spreadTime(false as any));
            assert.throws(() => Util.spreadTime(true as any));
        });
    });

    describe("hash()", () => {
        it("should hash a snowflake", () => {
            expect(Util.hash("285578743324606482", 100)).to.be.a("number").and.to.equal(78);
            expect(Util.hash("531932528131702785", 100)).to.be.a("number").and.to.equal(32);
        });
    });
});
