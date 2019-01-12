import {expect} from "chai";
import {TestSubjects} from "./test-bot";

describe("Rgb", () => {
    describe("toString()", () => {
        it("should return the Rgb in string format", () => {
            expect(TestSubjects.rgb.toString()).to.be.an("string").and.to.equal("5, 10, 15");
        });
    });
});