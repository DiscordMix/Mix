import {expect} from "chai";
import {TestSubjects} from "./test-bot";

describe("Rgba", () => {
    describe("toString()", () => {
        it("should return the Rgba in string format", () => {
            expect(TestSubjects.rgba.toString()).to.be.an("string").and.to.equal("5, 10, 15, 1");
        });
    });
});