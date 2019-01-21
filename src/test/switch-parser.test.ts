import {expect} from "chai";
import {describe} from "mocha";
import FlagParser from "../commands/switch-parser";
import {TestSubjects} from "./test-bot";

describe("Switch Parser", () => {
    describe("getSwitches()", () => {
        const result1 = FlagParser.getSwitches(TestSubjects.switches.short);
        const result2 = FlagParser.getSwitches(TestSubjects.switches.long);
        const result3 = FlagParser.getSwitches(TestSubjects.switches.longValue);
        const result4 = FlagParser.getSwitches(TestSubjects.switches.longQuotedValue);
        const result5 = FlagParser.getSwitches(TestSubjects.switches.multiple);
        const result6 = FlagParser.getSwitches(TestSubjects.switches.multipleValues);
        const result7 = FlagParser.getSwitches(TestSubjects.switches.multipleQuotedValues);

        it("parse command switches into objects", () => {
            for (const item of result1) {
                expect(item).to.be.an("object");
            }
        });

        // Short
        it("should parse short switches", () => {
            expect(result1[0].key).to.equal("h");
            expect(result1[0].short).to.equal(true);
            expect(result1[0].value).to.equal(null);
        });

        // Long
        it("should parse long switches", () => {
            expect(result2[0].key).to.equal("help");
            expect(result2[0].short).to.equal(false);
            expect(result2[0].value).to.equal(null);
        });

        // Long Value
        it("should parse long switch's values", () => {
            expect(result3[0].key).to.equal("help");
            expect(result3[0].short).to.equal(false);
            expect(result3[0].value).to.equal("hello");
        });

        // Long Quoted Value
        it("should parse long switch's quoted values", () => {
            expect(result4[0].key).to.equal("help");
            expect(result4[0].short).to.equal(false);
            expect(result4[0].value).to.equal("hello world");
        });

        // Multiple Switches Short
        it("should parse multiple short switches", () => {
            // Multiple -> -h
            expect(result5[0].key).to.equal("h");
            expect(result5[0].short).to.equal(true);
            expect(result5[0].value).to.equal(null);

            // Multiple -> -q
            expect(result5[1].key).to.equal("q");
            expect(result5[1].short).to.equal(true);
            expect(result5[1].value).to.equal(null);
        });

        // Multiple Switches Long
        it("should parse multiple long switches", () => {
            // Multiple -> --hello
            expect(result5[2].key).to.equal("hello");
            expect(result5[2].short).to.equal(false);
            expect(result5[2].value).to.equal(null);

            // Multiple -> --world
            expect(result5[3].key).to.equal("world");
            expect(result5[3].short).to.equal(false);
            expect(result5[3].value).to.equal(null);
        });

        // Multiple Values Short
        it("should parse multiple short switches' values", () => {
            // Multiple Values -> -h
            expect(result6[0].key).to.equal("h");
            expect(result6[0].short).to.equal(true);
            expect(result6[0].value).to.equal(null);

            // Multiple Values -> -q
            expect(result6[1].key).to.equal("q");
            expect(result6[1].short).to.equal(true);
            expect(result6[1].value).to.equal(null);
        });

        // Multiple Values Long
        it("should parse multiple long switches' values", () => {
            // Multiple Values -> --hello
            expect(result6[2].key).to.equal("hello");
            expect(result6[2].short).to.equal(false);
            expect(result6[2].value).to.equal("world");

            // Multiple Values -> --world
            expect(result6[3].key).to.equal("world");
            expect(result6[3].short).to.equal(false);
            expect(result6[3].value).to.equal("hello");
        });

        // Multiple Quoted Values Short
        it("should parse multiple short switches' quoted values", () => {
            // Multiple Quoted Values -> -h
            expect(result7[0].key).to.equal("h");
            expect(result7[0].short).to.equal(true);
            expect(result7[0].value).to.equal(null);

            // Multiple Quoted Values -> -q
            expect(result7[1].key).to.equal("q");
            expect(result7[1].short).to.equal(true);
            expect(result7[1].value).to.equal(null);
        });

        // Multiple Quoted Values Long
        it("should parse multiple long switches' quoted values", () => {
            // Multiple Quoted Values -> --hello="world hello"
            expect(result7[2].key).to.equal("hello");
            expect(result7[2].short).to.equal(false);
            expect(result7[2].value).to.equal("world hello");

            // Multiple Quoted Values -> --world="hello world"
            expect(result7[3].key).to.equal("world");
            expect(result7[3].short).to.equal(false);
            expect(result7[3].value).to.equal("hello world");
        });
    });
});
