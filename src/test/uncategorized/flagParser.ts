import {Unit, Test, Assert, Is} from "unit";
import {TestSubjects} from "../testBot";
import FlagParser from "../../commands/flagParser";

const result1 = FlagParser.getFlags(TestSubjects.flags.short);
const result2 = FlagParser.getFlags(TestSubjects.flags.long);
const result3 = FlagParser.getFlags(TestSubjects.flags.longValue);
const result4 = FlagParser.getFlags(TestSubjects.flags.longQuotedValue);
const result5 = FlagParser.getFlags(TestSubjects.flags.multiple);
const result6 = FlagParser.getFlags(TestSubjects.flags.multipleValues);
const result7 = FlagParser.getFlags(TestSubjects.flags.multipleQuotedValues);

@Unit("Flag Parser")
default class {
    @Test("Should parse command flags into objects")
    public getSwitches_parseIntoObjs() {
        for (const item of result1) {
            Assert.that(item, Is.object);
        }
    }

    // Short.
    @Test("Should parse short flags")
    public getSwitches_parseShort() {
        Assert.equal(result1[0].key, "h");
        Assert.true(result1[0].short);
        Assert.that(result1[0].value, Is.null);
    }

    // Long.
    @Test("Should parse long flags")
    public getSwitches_parseLong() {
        Assert.equal(result2[0].key, "help");
        Assert.false(result2[0].short);
        Assert.that(result2[0].value, Is.null);
    }

    // Long value.
    @Test("Should parse long flags's values")
    public getSwitches_longValue() {
        Assert.equal(result3[0].key, "help");
        Assert.false(result3[0].short);
        Assert.equal(result3[0].value, "hello");
    }

    // Long quoted value.
    @Test("Should parse long flags's quoted values")
    public getSwitches_longQuotedValue() {
        Assert.equal(result4[0].key, "help");
        Assert.false(result4[0].short);
        Assert.equal(result4[0].value, "hello world");
    }

    // Multiple flags short.
    @Test("Should parse multiple short flags")
    public getSwitches_multipleShort() {
        // Multiple -> -h.
        Assert.equal(result5[0].key, "h");
        Assert.true(result5[0].short);
        Assert.that(result5[0].value, Is.null);

        // Multiple -> -q.
        Assert.equal(result5[1].key, "q");
        Assert.true(result5[1].short);
        Assert.that(result5[1].value, Is.null);
    }

    // Multiple flags long.
    @Test("Should parse multiple long flags")
    public getSwitches_multipleLong() {
        // Multiple -> --hello.
        Assert.equal(result5[2].key, "hello");
        Assert.false(result5[2].short);
        Assert.that(result5[2].value, Is.null);

        // Multiple -> --world.
        Assert.equal(result5[3].key, "world");
        Assert.false(result5[3].short);
        Assert.that(result5[3].value, Is.null);
    }

    // Multiple values short.
    @Test("Should parse multiple short flags' values")
    public getSwitches_multipleValuesShort() {
        // Multiple values -> -h.
        Assert.equal(result6[0].key, "h");
        Assert.true(result6[0].short);
        Assert.that(result6[0].value, Is.null);

        // Multiple values -> -q.
        Assert.equal(result6[1].key, "q");
        Assert.true(result6[1].short);
        Assert.that(result6[1].value, Is.null);
    }

    // Multiple values long.
    @Test("Should parse multiple long flags' values")
    public getSwitches_multipleValuesLong() {
        // Multiple values -> --hello.
        Assert.equal(result6[2].key, "hello");
        Assert.false(result6[2].short);
        Assert.equal(result6[2].value, "world");

        // Multiple values -> --world.
        Assert.equal(result6[3].key, "world");
        Assert.false(result6[3].short);
        Assert.equal(result6[3].value, "hello");
    }

    // Multiple quoted values short.
    @Test("Should parse multiple short flags' quoted values")
    public getSwitches_multipleQuotedValuesShort() {
        // Multiple Quoted Values -> -h.
        Assert.equal(result7[0].key, "h");
        Assert.true(result7[0].short);
        Assert.that(result7[0].value, Is.null);

        // Multiple Quoted Values -> -q.
        Assert.equal(result7[1].key, "q");
        Assert.true(result7[1].short);
        Assert.that(result7[1].value, Is.null);
    }

    // Multiple quoted values long.
    @Test("Should parse multiple long flags' quoted values")
    public getSwitches_multipleQuotedValuesLong() {
        // Multiple quoted values -> --hello="world hello".
        Assert.equal(result7[2].key, "hello");
        Assert.false(result7[2].short);
        Assert.equal(result7[2].value, "world hello");

        // Multiple quoted values -> --world="hello world".
        Assert.equal(result7[3].key, "world");
        Assert.false(result7[3].short);
        Assert.equal(result7[3].value, "hello world");
    }
}
