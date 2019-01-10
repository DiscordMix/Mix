import TimeConvert from "../time/time-convert";
import {expect} from "chai";
import assert = require("assert");

describe("Time Convert", () => {
    describe("format()", () => {
        it("should format specified time", () => {
            expect(TimeConvert.format(1_000, "%i")).to.be.a("string").and.to.equal("1000");
            expect(TimeConvert.format(1_000, "%s")).to.be.a("string").and.to.equal("1");
            expect(TimeConvert.format(1_000 * 60, "%m")).to.be.a("string").and.to.equal("1");
            expect(TimeConvert.format(1_000 * 60 * 60, "%h")).to.be.a("string").and.to.equal("1");
            expect(TimeConvert.format(1_000 * 60 * 60 * 60, "%h")).to.be.a("string").and.to.equal("60");

            expect(TimeConvert.format(1_000, "ms: %i, seconds: %s")).to.be.a("string").and.to.equal("ms: 1000, seconds: 1");
            expect(TimeConvert.format(1_000, "ms: %i (%i), seconds: %s (%s)")).to.be.a("string").and.to.equal("ms: 1000 (1000), seconds: 1 (1)");
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => TimeConvert.format(undefined as any, "test"));
            assert.throws(() => TimeConvert.format("test" as any, undefined as any));
            assert.throws(() => TimeConvert.format(1 as any, undefined as any));
            assert.throws(() => TimeConvert.format(null as any, undefined as any));
            assert.throws(() => TimeConvert.format({} as any, undefined as any));
            assert.throws(() => TimeConvert.format([] as any, undefined as any));
            assert.throws(() => TimeConvert.format("" as any, undefined as any));
            assert.throws(() => TimeConvert.format(0 as any, undefined as any));
            assert.throws(() => TimeConvert.format(true as any, undefined as any));
            assert.throws(() => TimeConvert.format(false as any, undefined as any));

            assert.throws(() => TimeConvert.format(1, null as any));
            assert.throws(() => TimeConvert.format(1, 1 as any));
            assert.throws(() => TimeConvert.format(1, 0 as any));
            assert.throws(() => TimeConvert.format(1, true as any));
            assert.throws(() => TimeConvert.format(1, false as any));
            assert.throws(() => TimeConvert.format(1, {} as any));
            assert.throws(() => TimeConvert.format(1, [] as any));
        });
    });
});