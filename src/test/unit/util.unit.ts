import {Unit, Test, Assert, Feed} from "unit";
import Util from "../../core/util";

@Unit("Util")
default class {
    @Test("percentOf(): should determine the percentage")
    @Feed(5, 10, 50)
    @Feed(10, 10, 100)
    @Feed(0, 0, 100)
    @Feed(1, 0, 0)
    public percentOf(amount: number, max: number, expected: number): void {
        Assert.equal(expected, Util.percentOf(amount, max));
    }

    @Test("percentOf(): should throw on invalid parameters")
    @Feed(-1, 1)
    @Feed(-1, -1)
    @Feed(1, -1)
    public percentOfThrows(amount: number, max: number): void {
        Assert.throws(() => Util.percentOf(amount, max));
    }

    @Test("isEmpty(): should determine whether empty")
    @Feed("")
    @Feed(null)
    @Feed(undefined)
    @Feed([])
    @Feed({})
    public isEmpty(input: any): void {
        Assert.true(Util.isEmpty(input));
    }

    @Test("escapeText(): should determine if text is escaped")
    @Feed("john doe", "john doe")
    public escapeText(input: string, expected: string): void {
        Assert.equal(input, expected);
    }
}
