import {Unit, Test, Assert, Feed, Is} from "unit";
import Util from "../../../core/util";
import {TestSubjects} from "../test-bot";
import {Snowflake} from "../../../core/bot-extra";

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

    @Test("should escape tokens")
    @Feed(TestSubjects.token, TestSubjects.token, "[Token]")
    @Feed("hi world, hello world, john doe", "hello world", "hi world, [Token], john doe")
    @Feed(`hi world, ${TestSubjects.token}, john doe`, "hello world", "hi world, [Token], john doe")
    @Feed(`hi world, ${TestSubjects.token}, john doe, hello world, hi`, "hello world", "hi world, [Token], john doe, [Token], hi")
    public escapeText_escapeTokens(input: string, token: string, expected: string) {
        Assert.equal(Util.escapeText(input, token), expected);
    }

    @Test("should escape IPv4s")
    @Feed("192.168.0.1", "[IPv4]")
    @Feed("53.32.53.252", "[IPv4]")
    @Feed("hello 192.168.0.1 world", "hello [IPv4] world")
    public escapeText_escapeIPv4(input: string, expected: string) {
        Assert.equal(Util.escapeText(input, "empty"), expected);
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
