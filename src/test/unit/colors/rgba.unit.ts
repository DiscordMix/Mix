import {Unit, Test, Assert} from "unit";
import {TestSubjects} from "../../test-bot";

@Unit("RGBA")
default class {
    @Test("toString(): should return the Rgba in string format")
    public toString(): void {
        Assert.equal(TestSubjects.rgba.toString(), "5, 10, 15, 1");
    }
}
