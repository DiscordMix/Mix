import {expect} from "chai";
import {Delta} from "..";

describe("Delta", () => {
    describe("compare()", () => {
        it("should compare two objects", () => {
            const obj1: object = {
                first: "hello",
                second: "world"
            };

            const obj2: object = {
                third: "john",
                first: "world",
                second: "world"
            };

            expect(Delta.compare(obj1, obj2)).to.be.an("array").and.to.contain("first").and.to.contain("third");
        });
    });
});