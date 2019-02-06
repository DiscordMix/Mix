import {unit, test, Assert, feed, Is} from "unit";
import Util from "../../../core/util";
import {TestSubjects} from "../test-bot";
import {Snowflake} from "../../../core/bot-extra";

@unit("Util")
default class {
    @test("percentOf(): should determine the percentage")
    @feed(5, 10, 50)
    @feed(10, 10, 100)
    @feed(0, 0, 100)
    @feed(1, 0, 0)
    public percentOf_determineThePercentage(amount: number, max: number, expected: number) {
        Assert.equal(expected, Util.percentOf(amount, max));
    }

    @test("percentOf(): should throw on invalid parameters")
    @feed(-1, 1)
    @feed(-1, -1)
    @feed(1, -1)
    public percentOf_throwsOnInvalidParams(amount: number, max: number) {
        Assert.throws(() => Util.percentOf(amount, max));
    }

    @test("isEmpty(): should determine whether empty")
    @feed("")
    @feed(null)
    @feed(undefined)
    @feed([])
    @feed({})
    public isEmpty_determineIfEmpty(input: any) {
        Assert.true(Util.isEmpty(input));
    }

    // TODO: This is wrong?
    @test("escapeText(): should determine if text is escaped")
    @feed("john doe", "john doe")
    public escapeText_determineIfEscaped(input: string, expected: string) {
        Assert.equal(input, expected);
    }

    @test("should escape tokens")
    @feed(TestSubjects.token, TestSubjects.token, "[Token]")
    @feed("hi world, hello world, john doe", "hello world", "hi world, [Token], john doe")
    @feed(`hi world, ${TestSubjects.token}, john doe`, "hello world", "hi world, [Token], john doe")
    @feed(`hi world, ${TestSubjects.token}, john doe, hello world, hi`, "hello world", "hi world, [Token], john doe, [Token], hi")
    public escapeText_escapeTokens(input: string, token: string, expected: string) {
        Assert.equal(Util.escapeText(input, token), expected);
    }

    @test("should escape IPv4s")
    @feed("192.168.0.1", "[IPv4]")
    @feed("53.32.53.252", "[IPv4]")
    @feed("hello 192.168.0.1 world", "hello [IPv4] world")
    public escapeText_escapeIPv4(input: string, expected: string) {
        Assert.equal(Util.escapeText(input, "empty"), expected);
    }

    @test("hasMentionPrefix(): should return whether the text provided start with a mention")
    public hasMentionPrefix_determineIfStartsWithPrefix() {
        Assert.true(Util.hasMentionPrefix(`<@${TestSubjects.ids[0]}> hello world`, TestSubjects.ids[0]));
        Assert.false(Util.hasMentionPrefix(`hello world <@${TestSubjects.ids[0]}>`, TestSubjects.ids[0]));
    }

    @test("hasMentionPrefix(): should throw an error when provided invalid input")
    @feed(undefined, undefined)
    @feed(null, null)
    @feed(4, 543)
    @feed({}, "test")
    public hasMentionPrefix_throwsOnInvalidParams(text: string, userId: string) {
        Assert.throws(() => Util.hasMentionPrefix(text, userId));
    }

    @test("timeAgo(): should return a string")
    public timeAgo_returnString() {
        Assert.that(Util.timeAgo(Date.now()), Is.string);
    }

    @test("hash(): should hash a snowflake")
    @feed("285578743324606482", 78)
    @feed("531932528131702785", 32)
    public hash_hashSnowflake(input: Snowflake, expected: number) {
        Assert.equal(Util.hash(input, 100), expected);
    }

    @test("spreadTime(): should return spread time")
    @feed(1000, "1 000")
    @feed(10_000, "10 000")
    @feed(531_352, "531 352")
    @feed(1, "1")
    @feed(10, "10")
    // @feed(-15_050_050, "-15 050 050") // TODO: Not working
    public spreadTime_returnSpreadTime(input: number, expected: string) {
        Assert.equal(Util.spreadTime(input), expected);
    }

    @test("spreadTime(): should apply delimiters")
    @feed(1000, ",", "1,000")
    @feed(1, ",", "1")
    @feed(100_000, ",", "100,000")
    @feed(-1000, ",", "-1,000")
    public spreadTime_applyDelimiters(input: number, delimiter: string, expected: string) {
        Assert.equal(Util.spreadTime(input, delimiter), expected);
    }

    @test("spreadTime(): should throw on invalid parameters")
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
