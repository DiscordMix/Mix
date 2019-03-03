import {unit, test, Assert} from "unit";
import {TestSubjects} from "../test-bot";

@unit("RGBA")
default class {
    @test("toString(): should return the Rgba in string format")
    public toString(): void {
        Assert.equal(TestSubjects.rgba.toString(), "5, 10, 15, 1");
    }
}
