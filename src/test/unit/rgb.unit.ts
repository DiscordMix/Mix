import {Unit, Test, Assert} from "unit";
import {TestSubjects} from "../test-bot";

@Unit("RGB")
default class {
    @Test("toString: should return the Rgb in string format")
    public toString(): void {
        Assert.equal(TestSubjects.rgb.toString(), "5, 10, 15");
    }
}
