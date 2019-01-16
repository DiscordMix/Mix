import {Unit, Test, Assert, Feed} from "unit";
import Util from "../core/utils";

@Unit("Util")
abstract class UtilTests {
    @Test("percentOf: should determine the percentage")
    @Feed(5, 10, 50)
    public percentOf(amount: number, max: number, expected: number): void {
        Assert.equals(expected, Util.percentOf(amount, max));
    }
}
