import {Unit, Test, Assert, Feed, Is, Does} from "unit";
import Util, {IBinarySearchResult} from "../../../Core/Util";
import {TestSubjects} from "../TestBot";
import {Snowflake} from "../../../Core/BotExtra";

const populated: number[] = Util.populate(50);

@Unit("Util")
default class {
    @Test("percentOf(): should determine the percentage")
    @Feed(5, 10, 50)
    @Feed(10, 10, 100)
    @Feed(0, 0, 100)
    @Feed(1, 0, 0)
    public percentOf_determineThePercentage(amount: number, max: number, expected: number) {
        Assert.equal(expected, Util.percentOf(amount, max));
    }

    @Test("percentOf(): should throw on invalid parameters")
    @Feed(-1, 1)
    @Feed(-1, -1)
    @Feed(1, -1)
    public percentOf_throwsOnInvalidParams(amount: number, max: number) {
        Assert.throws(() => Util.percentOf(amount, max));
    }

    @Test("isEmpty(): should determine whether empty")
    @Feed("")
    @Feed(null)
    @Feed(undefined)
    @Feed([])
    @Feed({})
    public isEmpty_determineIfEmpty(input: any) {
        Assert.true(Util.isEmpty(input));
    }

    // TODO: This is wrong?
    @Test("escapeText(): should determine if text is escaped")
    @Feed("john doe", "john doe")
    public escapeText_determineIfEscaped(input: string, expected: string) {
        Assert.equal(input, expected);
    }

    @Test("escapeText(): should escape tokens")
    @Feed(TestSubjects.token, TestSubjects.token, "[Token]")
    @Feed("hi world, hello world, john doe", "hello world", "hi world, [Token], john doe")
    @Feed(`hi world, ${TestSubjects.token}, john doe`, "hello world", "hi world, [Token], john doe")
    @Feed(`hi world, ${TestSubjects.token}, john doe, hello world, hi`, "hello world", "hi world, [Token], john doe, [Token], hi")
    public escapeText_escapeTokens(input: string, token: string, expected: string) {
        Assert.equal(Util.escapeText(input, token), expected);
    }

    @Test("escapeText(): should escape IPv4s")
    @Feed("192.168.0.1", "[IPv4]")
    @Feed("53.32.53.252", "[IPv4]")
    @Feed("hello 192.168.0.1 world", "hello [IPv4] world")
    public escapeText_escapeIPv4(input: string, expected: string) {
        Assert.equal(Util.escapeText(input, "empty"), expected);
    }

    @Test("escapeText(): should escape mentions")
    public escapeText_escapeMentions() {
        Assert.equal(Util.escapeText("@everyone hello world", "empty"), "[Mention] hello world");
        Assert.equal(Util.escapeText("hello @everyone world", "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText("@here hello world", "empty"), "[Mention] hello world");
        Assert.equal(Util.escapeText("hello @here world", "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText("hello @here world @everyone john", "empty"), "hello [Mention] world [Mention] john");
        Assert.equal(Util.escapeText("@herehello @here world@everyonejohn", "empty"), "[Mention]hello [Mention] world[Mention]john");
        Assert.equal(Util.escapeText(`hello ${TestSubjects.ids[0]} world`, "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText(`hello ${TestSubjects.ids[1]} world`, "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText(`hello ${TestSubjects.ids[2]} world`, "empty"), "hello [Mention] world");
        Assert.equal(Util.escapeText(`hello ${TestSubjects.ids[3]} world`, "empty"), `hello ${TestSubjects.ids[3]} world`);
    }

    @Test("escapeText(): should throw when provided invalid input")
    public escapeText_throwOnInvalidParams() {
        Assert.throws(() => Util.escapeText(undefined as any, undefined as any));
        Assert.throws(() => Util.escapeText(null as any, null as any));
        Assert.throws(() => Util.escapeText(undefined as any, null as any));
        Assert.throws(() => Util.escapeText(null as any, undefined as any));
        Assert.throws(() => Util.escapeText({} as any, 465 as any));
        Assert.throws(() => Util.escapeText(52 as any, {} as any));
    }

    @Test("resolveId(): should return the resolved ids")
    public resolveId_returnResolvedIds() {
        // TODO: Review?
        for (const id of TestSubjects.ids) {
            const result: any = Util.resolveId(id);

            Assert.that(result,
                Is.string,
                Does.haveLength(18)
            );
        }
    }

    @Test("resolveIds(): should throw on invalid parameters")
    public resolveId_throwOnInvalidParams() {
        Assert.throws(() => Util.resolveId(undefined as any));
        Assert.throws(() => Util.resolveId(1 as any));
        Assert.throws(() => Util.resolveId(0 as any));
        Assert.throws(() => Util.resolveId(false as any));
        Assert.throws(() => Util.resolveId(true as any));
        Assert.throws(() => Util.resolveId({} as any));
        Assert.throws(() => Util.resolveId([] as any));
    }

    @Test("getRandomInt(): should return a random number")
    public getRandomInt_returnRandomNumber() {
        const result: number | null = Util.getRandomInt(0, 2);

        Assert.that(result, Is.number);
        Assert.that([0, 1], Does.include(result));
    }

    @Test("getRandomInt(): should throw on invalid parameters")
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

    @Test("timeFromNow(): should return the time from now in milliseconds")
    public timeFromNow_returnTimeInMilliseconds() {
        const result = Util.timeFromNow(0, 0, 50);

        Assert.that(result, Is.number);
        Assert.that(result.toString(), Does.haveLength(13));
    }

    @Test("shuffle(): should return an array with equal length to input")
    public shuffle_shuffleAnArray() {
        Assert.that(Util.shuffle(["hello", "my", "name", "is", "john doe"]), Is.arrayWithLength(5));
        Assert.that(Util.shuffle([]), Is.arrayWithLength(0));
    }

    @Test("shuffle(): should throw on invalid parameters")
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

    @Test("getUserIdentifier(): should return a valid user identifier")
    public getUserIdentifier_returnValidIdentifier() {
        const result1: string = Util.getUserIdentifier({
            id: TestSubjects.ids[3],
            tag: "JohnDoe#1234"
        } as any);

        Assert.equal(result1, `<@${TestSubjects.ids[3]}> (JohnDoe#1234:${TestSubjects.ids[3]})`);
    }

    @Test("getUserIdentifier(): should throw when provided invalid input")
    public getUserIdentifier_throwOnInvalidParams() {
        Assert.throws(() => Util.getUserIdentifier("" as any));
        Assert.throws(() => Util.getUserIdentifier("hello world" as any));
        Assert.throws(() => Util.getUserIdentifier(123 as any));
        Assert.throws(() => Util.getUserIdentifier({} as any));
    }

    @Test("populate(): should populate an array")
    public populate_populateAnArray() {
        Assert.that(populated, Is.arrayWithLength(50));
    }

    @Test("populate(): should throw on invalid parameters")
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

    @Test("binarySearch(): should find an existing item")
    public binarySearch_findExistingItem() {
        const result: IBinarySearchResult = Util.binarySearch(3, populated);

        Assert.that(result, Is.object);
        Assert.true(result.found);
        Assert.equal(result.iterations, 6);
    }

    @Test("binarySearch(): should throw on invalid parameters")
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

    @Test("binaryInsert(): should determine an index to insert")
    public binaryInsert_determineIndex() {
        populated.splice(5, 1);

        const index: number = Util.binaryInsert(5, populated);

        Assert.equal(index, 4);

        populated.splice(index + 1, 0, 5);
    }

    @Test("binaryInsert(): should throw on invalid parameters")
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

    @Test("hasMentionPrefix(): should return whether the text provided start with a mention")
    public hasMentionPrefix_determineIfStartsWithPrefix() {
        Assert.true(Util.hasMentionPrefix(`<@${TestSubjects.ids[0]}> hello world`, TestSubjects.ids[0]));
        Assert.false(Util.hasMentionPrefix(`hello world <@${TestSubjects.ids[0]}>`, TestSubjects.ids[0]));
    }

    @Test("hasMentionPrefix(): should throw an error when provided invalid input")
    @Feed(undefined, undefined)
    @Feed(null, null)
    @Feed(4, 543)
    @Feed({}, "test")
    public hasMentionPrefix_throwsOnInvalidParams(text: string, userId: string) {
        Assert.throws(() => Util.hasMentionPrefix(text, userId));
    }

    @Test("timeAgo(): should return a string")
    public timeAgo_returnString() {
        Assert.that(Util.timeAgo(Date.now()), Is.string);
    }

    @Test("hash(): should hash a snowflake")
    @Feed("285578743324606482", 78)
    @Feed("531932528131702785", 32)
    public hash_hashSnowflake(input: Snowflake, expected: number) {
        Assert.equal(Util.hash(input, 100), expected);
    }

    @Test("spreadTime(): should return spread time")
    @Feed(1000, "1 000")
    @Feed(10_000, "10 000")
    @Feed(531_352, "531 352")
    @Feed(1, "1")
    @Feed(10, "10")
    // @Feed(-15_050_050, "-15 050 050") // TODO: Not working
    public spreadTime_returnSpreadTime(input: number, expected: string) {
        Assert.equal(Util.spreadTime(input), expected);
    }

    @Test("spreadTime(): should apply delimiters")
    @Feed(1000, ",", "1,000")
    @Feed(1, ",", "1")
    @Feed(100_000, ",", "100,000")
    @Feed(-1000, ",", "-1,000")
    public spreadTime_applyDelimiters(input: number, delimiter: string, expected: string) {
        Assert.equal(Util.spreadTime(input, delimiter), expected);
    }

    @Test("spreadTime(): should throw on invalid parameters")
    @Feed("test")
    @Feed("")
    @Feed(undefined)
    @Feed(null)
    @Feed([])
    @Feed({})
    @Feed(false)
    @Feed(true)
    public spreadTime_throwsOnInvalidParams(input: any) {
        Assert.throws(() => Util.spreadTime(input));
    }
}
