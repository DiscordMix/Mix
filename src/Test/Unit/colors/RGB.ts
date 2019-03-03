import {unit, test, Assert} from "unit";
import {TestSubjects} from "../TestBot";

@unit("RGB")
default class {
    @test("toString(): should return the Rgb in string format")
    public toString(): void {
        Assert.equal(TestSubjects.rgb.toString(), "5, 10, 15");
    }
}
