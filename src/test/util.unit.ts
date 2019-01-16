import {Unit, Test, Assert, Feed} from "unit";
import Util from "../core/utils";

@Unit("Util")
abstract class UtilTests {
    @Test("percentOf: should determine the percentage")
    @Feed(5, 10, 50)
    @Feed(10, 10, 100)
    @Feed(0, 0, 100)
    @Feed(1, 0, 0)
    public percentOf(amount: number, max: number, expected: number): void {
        Assert.equals(expected, Util.percentOf(amount, max));
    }

    @Test("percentOf: should throw on invalid parameters")
    @Feed(-1, 1)
    @Feed(-1, -1)
    @Feed(1, -1)
    public percentOfThrows(amount: number, max: number): void {
        Assert.throws(() => Util.percentOf(amount, max));
    }
}
