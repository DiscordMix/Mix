import {unit, test, Assert, feed, Is, Does, target} from "unit";
import Util, {IBinarySearchResult} from "../../util/util";
import {testSubjects} from "../testBot";
import {Snowflake} from "../../core/botExtra";

const populated: number[] = Util.populate(50);

@unit("Util")
default class {
    @test("should determine the percentage")
    @target(Util.percentOf)
    @feed(5, 10, 50)
    @feed(10, 10, 100)
    @feed(0, 0, 100)
    @feed(1, 0, 0)
    public percentOf_determineThePercentage(amount: number, max: number, expected: number) {
        Assert.equal(expected, Util.percentOf(amount, max));
    }

    @test("should throw on invalid parameters")
    @target(Util.percentOf)
    @feed(-1, 1)
    @feed(-1, -1)
    @feed(1, -1)
    public percentOf_throwsOnInvalidParams(amount: number, max: number) {
        Assert.throws(() => Util.percentOf(amount, max));
    }

    @test("should determine whether empty")
    @target(Util.isEmpty)
    @feed("")
    @feed(null)
    @feed(undefined)
    @feed([])
    @feed({})
    public isEmpty_determineIfEmpty(input: any) {
        Assert.true(Util.isEmpty(input));
    }

    // TODO: This is wrong?
    @test("should determine if text is escaped")
    @target(Util.escapeText)
    @feed("john doe", "john doe")
    public escapeText_determineIfEscaped(input: string, expected: string) {
        Assert.equal(input, expected);
    }

    @test("should escape tokens")
    @target(Util.escapeText)
    @feed(testSubjects.token, testSubjects.token, "[Token]")
    @feed("hi world, hello world, john doe", "hello world", "hi world, [Token], john doe")
    @feed(`hi world, ${testSubjects.token}, john doe`, "hello world", "hi world, [Token], john doe")
    @feed(`hi world, ${testSubjects.token}, john doe, hello world, hi`, "hello world", "hi world, [Token], john doe, [Token], hi")
    public escapeText_escapeTokens(input: string, token: string, expected: string) {
        Assert.equal(Util.escapeText(input, token), expected);
    }

    @test("should escape IPv4s")
    @target(Util.escapeText)
    @feed("192.168.0.1", "[IPv4]")
    @feed("53.32.53.252", "[IPv4]")
    @feed("hello 192.168.0.1 world", "hello [IPv4] world")
    public escapeText_escapeIPv4(input: string, expected: string) {
        Assert.equal(Util.escapeText(input, "empty"), expected);
    }

    @test("should escape mentions")
    @target(Util.escapeText)
    public escapeText_escapeMentions() {
        Assert.equal(Util.escapeText("@everyone hello world", "empty"), "[Mention] hello world");
        Assert.equal(Util.escapeText("hello @everyone world", "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText("@here hello world", "empty"), "[Mention] hello world");
        Assert.equal(Util.escapeText("hello @here world", "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText("hello @here world @everyone john", "empty"), "hello [Mention] world [Mention] john");
        Assert.equal(Util.escapeText("@herehello @here world@everyonejohn", "empty"), "[Mention]hello [Mention] world[Mention]john");
        Assert.equal(Util.escapeText(`hello ${testSubjects.ids[0]} world`, "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText(`hello ${testSubjects.ids[1]} world`, "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText(`hello ${testSubjects.ids[2]} world`, "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText(`hello ${testSubjects.ids[3]} world`, "empty"), `hello ${testSubjects.ids[3]} world`);
    }

    @test("should throw when provided invalid input")
    @target(Util.escapeText)
    public escapeText_throwOnInvalidParams() {
        Assert.throws(() => Util.escapeText(undefined as any, undefined as any));
        Assert.throws(() => Util.escapeText(null as any, null as any));
        Assert.throws(() => Util.escapeText(undefined as any, null as any));
        Assert.throws(() => Util.escapeText(null as any, undefined as any));
        Assert.throws(() => Util.escapeText({} as any, 465 as any));
        Assert.throws(() => Util.escapeText(52 as any, {} as any));
    }

    @test("should return the resolved ids")
    @target(Util.resolveId)
    public resolveId_returnResolvedIds() {
        // TODO: Review?
        for (const id of testSubjects.ids) {
            const result: any = Util.resolveId(id);

            Assert.that(result,
                Is.string,
                Does.haveLength(18)
            );
        }
    }

    @test("should throw on invalid parameters")
    @target(Util.resolveId)
    public resolveId_throwOnInvalidParams() {
        Assert.throws(() => Util.resolveId(undefined as any));
        Assert.throws(() => Util.resolveId(1 as any));
        Assert.throws(() => Util.resolveId(0 as any));
        Assert.throws(() => Util.resolveId(false as any));
        Assert.throws(() => Util.resolveId(true as any));
        Assert.throws(() => Util.resolveId({} as any));
        Assert.throws(() => Util.resolveId([] as any));
    }

    @test("should return a random number")
    @target(Util.getRandomInt)
    public getRandomInt_returnRandomNumber() {
        const result: number | null = Util.getRandomInt(0, 2);

        Assert.that(result, Is.number);
        Assert.that([0, 1], Does.include(result));
    }

    @test("should throw on invalid parameters")
    @target(Util.getRandomInt)
    public getRandomInt_throwOnInvalidParams() {
        Assert.throws(() => Util.getRandomInt(0, 0));
        Assert.throws(() => Util.getRandomInt(0, -1));
        Assert.throws(() => Util.getRandomInt(50, 10));
        Assert.throws(() => Util.getRandomInt("hello" as any, 3));
        Assert.throws(() => Util.getRandomInt("" as any, 3));
        Assert.throws(() => Util.getRandomInt(3, "hello" as any));
        Assert.throws(() => Util.getRandomInt(3, "" as any));
        Assert.throws(() => Util.getRandomInt(undefined as any, 3));
        Assert.throws(() => Util.getRandomInt(3 as any, undefined as any));
        Assert.throws(() => Util.getRandomInt(null as any, 3));
        Assert.throws(() => Util.getRandomInt(3, null as any));
        Assert.throws(() => Util.getRandomInt({} as any, 3));
        Assert.throws(() => Util.getRandomInt(3, {} as any));
    }

    @test("should return the time from now in milliseconds")
    @target(Util.timeFromNow)
    public timeFromNow_returnTimeInMilliseconds() {
        const result = Util.timeFromNow(0, 0, 50);

        Assert.that(result, Is.number);
        Assert.that(result.toString(), Does.haveLength(13));
    }

    @test("should return an array with equal length to input")
    @target(Util.shuffle)
    public shuffle_shuffleAnArray() {
        Assert.that(Util.shuffle(["hello", "my", "name", "is", "john doe"]), Is.arrayWithLength(5));
        Assert.that(Util.shuffle([]), Is.arrayWithLength(0));
    }

    @test("should throw on invalid parameters")
    @target(Util.shuffle)
    public shuffle_throwsOnInvalidParams() {
        Assert.throws(() => Util.shuffle(undefined as any));
        Assert.throws(() => Util.shuffle(null as any));
        Assert.throws(() => Util.shuffle("" as any));
        Assert.throws(() => Util.shuffle("hello world" as any));
        Assert.throws(() => Util.shuffle(1 as any));
        Assert.throws(() => Util.shuffle(0 as any));
        Assert.throws(() => Util.shuffle({} as any));
        Assert.throws(() => Util.shuffle(false as any));
        Assert.throws(() => Util.shuffle(true as any));
    }

    @test("should return a valid user identifier")
    @target(Util.getUserIdentifier)
    public getUserIdentifier_returnValidIdentifier() {
        const result1: string = Util.getUserIdentifier({
            id: testSubjects.ids[3],
            tag: "JohnDoe#1234"
        } as any);

        Assert.equal(result1, `<@${testSubjects.ids[3]}> (JohnDoe#1234:${testSubjects.ids[3]})`);
    }

    @test("should throw when provided invalid input")
    @target(Util.getUserIdentifier)
    public getUserIdentifier_throwOnInvalidParams() {
        Assert.throws(() => Util.getUserIdentifier("" as any));
        Assert.throws(() => Util.getUserIdentifier("hello world" as any));
        Assert.throws(() => Util.getUserIdentifier(123 as any));
        Assert.throws(() => Util.getUserIdentifier({} as any));
    }

    @test("should populate an array")
    @target(Util.populate)
    public populate_populateAnArray() {
        Assert.that(populated, Is.arrayWithLength(50));
    }

    @test("should throw on invalid parameters")
    @target(Util.populate)
    public populate_throwOnInvalidParams() {
        Assert.throws(() => Util.populate(undefined as any));
        Assert.throws(() => Util.populate(null as any));
        Assert.throws(() => Util.populate([] as any));
        Assert.throws(() => Util.populate({} as any));
        Assert.throws(() => Util.populate(false as any));
        Assert.throws(() => Util.populate(true as any));
        Assert.throws(() => Util.populate("test" as any));
        Assert.throws(() => Util.populate("" as any));
    }

    @test("should find an existing item")
    @target(Util.binarySearch)
    public binarySearch_findExistingItem() {
        const result: IBinarySearchResult = Util.binarySearch(3, populated);

        Assert.that(result, Is.object);
        Assert.true(result.found);
        Assert.equal(result.iterations, 6);
    }

    @test("should throw on invalid parameters")
    @target(Util.binarySearch)
    public binarySearch_throwOnInvalidParams() {
        Assert.throws(() => Util.binarySearch(undefined as any, []));
        Assert.throws(() => Util.binarySearch(false as any, []));
        Assert.throws(() => Util.binarySearch(true as any, []));
        Assert.throws(() => Util.binarySearch([] as any, []));
        Assert.throws(() => Util.binarySearch({} as any, []));
        Assert.throws(() => Util.binarySearch(null as any, []));
        Assert.throws(() => Util.binarySearch("test" as any, []));
        Assert.throws(() => Util.binarySearch("" as any, []));
    }

    @test("should determine an index to insert")
    @target(Util.binaryInsert)
    public binaryInsert_determineIndex() {
        populated.splice(5, 1);

        const index: number = Util.binaryInsert(5, populated);

        Assert.equal(index, 4);

        populated.splice(index + 1, 0, 5);
    }

    @test("should throw on invalid parameters")
    @target(Util.binaryInsert)
    public binaryInsert_throwOnInvalidParams() {
        Assert.throws(() => Util.binaryInsert(undefined as any, []));
        Assert.throws(() => Util.binaryInsert(null as any, []));
        Assert.throws(() => Util.binaryInsert(false as any, []));
        Assert.throws(() => Util.binaryInsert(true as any, []));
        Assert.throws(() => Util.binaryInsert("hello" as any, []));
        Assert.throws(() => Util.binaryInsert("" as any, []));
        Assert.throws(() => Util.binaryInsert({} as any, []));
        Assert.throws(() => Util.binaryInsert([] as any, []));

        Assert.throws(() => Util.binaryInsert(undefined as any, null as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, undefined as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, false as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, true as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, "hello" as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, "" as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, {} as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, [] as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, 1 as any));
        Assert.throws(() => Util.binaryInsert(undefined as any, 0 as any));

        Assert.throws(() => Util.binaryInsert(1, 1 as any));
        Assert.throws(() => Util.binaryInsert(1, 0 as any));
        Assert.throws(() => Util.binaryInsert(1, {} as any));
        Assert.throws(() => Util.binaryInsert(1, null as any));
        Assert.throws(() => Util.binaryInsert(1, undefined as any));
        Assert.throws(() => Util.binaryInsert(1, "hello" as any));
        Assert.throws(() => Util.binaryInsert(1, "" as any));
        Assert.throws(() => Util.binaryInsert(1, true as any));
        Assert.throws(() => Util.binaryInsert(1, false as any));
    }

    @test("should return whether the text provided start with a mention")
    @target(Util.hasMentionPrefix)
    public hasMentionPrefix_determineIfStartsWithPrefix() {
        Assert.true(Util.hasMentionPrefix(`<@${testSubjects.ids[0]}> hello world`, testSubjects.ids[0]));
        Assert.false(Util.hasMentionPrefix(`hello world <@${testSubjects.ids[0]}>`, testSubjects.ids[0]));
    }

    @test("should throw an error when provided invalid input")
    @target(Util.hasMentionPrefix)
    @feed(undefined, undefined)
    @feed(null, null)
    @feed(4, 543)
    @feed({}, "test")
    public hasMentionPrefix_throwsOnInvalidParams(text: string, userId: string) {
        Assert.throws(() => Util.hasMentionPrefix(text, userId));
    }

    @test("should return a string")
    @target(Util.timeAgo)
    public timeAgo_returnString() {
        Assert.that(Util.timeAgo(Date.now()), Is.string);
    }

    @test("should hash a Snowflake")
    @target(Util.hash)
    @feed("285578743324606482", 78)
    @feed("531932528131702785", 32)
    public hash_hashSnowflake(input: Snowflake, expected: number) {
        Assert.equal(Util.hash(input, 100), expected);
    }

    @test("should return spread time")
    @target(Util.spreadTime)
    @feed(1000, "1 000")
    @feed(10_000, "10 000")
    @feed(531_352, "531 352")
    @feed(1, "1")
    @feed(10, "10")
    // @feed(-15_050_050, "-15 050 050") // TODO: Not working
    public spreadTime_returnSpreadTime(input: number, expected: string) {
        Assert.equal(Util.spreadTime(input), expected);
    }

    @test("should apply delimiters")
    @target(Util.spreadTime)
    @feed(1000, ",", "1,000")
    @feed(1, ",", "1")
    @feed(100_000, ",", "100,000")
    @feed(-1000, ",", "-1,000")
    public spreadTime_applyDelimiters(input: number, delimiter: string, expected: string) {
        Assert.equal(Util.spreadTime(input, delimiter), expected);
    }

    @test("should throw on invalid parameters")
    @target(Util.spreadTime)
    @feed("test")
    @feed("")
    @feed(undefined)
    @feed(null)
    @feed([])
    @feed({})
    @feed(false)
    @feed(true)
    public spreadTime_throwsOnInvalidParams(input: any) {
        Assert.throws(() => Util.spreadTime(input));
    }
}
