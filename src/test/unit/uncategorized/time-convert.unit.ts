import {Assert, Test, Unit} from "unit";
import TimeConvert from "../../../time/time-convert";

@Unit("Time Convert")
default class {
    @Test("should format specified time")
    public format_shouldFormat() {
        Assert.equal(TimeConvert.format(1000, "%i"), "1000");
        Assert.equal(TimeConvert.format(1000, "%s"), "1");
        Assert.equal(TimeConvert.format(1000 * 60, "%m"), "1");
        Assert.equal(TimeConvert.format(1000 * 60 * 60, "%h"), "1");
        Assert.equal(TimeConvert.format(1000 * 60 * 60 * 60, "%h"), "60");

        Assert.equal(TimeConvert.format(1000, "ms: %i, seconds: %s"), "ms: 1000, seconds: 1");
        Assert.equal(TimeConvert.format(1000, "ms: %i (%i), seconds: %s (%s)"), "ms: 1000 (1000), seconds: 1 (1)");
    }

    @Test("should throw on invalid parameters")
    public format_throwsOnInvalidParams() {
        Assert.throws(() => TimeConvert.format(undefined as any, "test"));
        Assert.throws(() => TimeConvert.format("test" as any, undefined as any));
        Assert.throws(() => TimeConvert.format(1 as any, undefined as any));
        Assert.throws(() => TimeConvert.format(null as any, undefined as any));
        Assert.throws(() => TimeConvert.format({} as any, undefined as any));
        Assert.throws(() => TimeConvert.format([] as any, undefined as any));
        Assert.throws(() => TimeConvert.format("" as any, undefined as any));
        Assert.throws(() => TimeConvert.format(0 as any, undefined as any));
        Assert.throws(() => TimeConvert.format(true as any, undefined as any));
        Assert.throws(() => TimeConvert.format(false as any, undefined as any));

        Assert.throws(() => TimeConvert.format(1, null as any));
        Assert.throws(() => TimeConvert.format(1, 1 as any));
        Assert.throws(() => TimeConvert.format(1, 0 as any));
        Assert.throws(() => TimeConvert.format(1, true as any));
        Assert.throws(() => TimeConvert.format(1, false as any));
        Assert.throws(() => TimeConvert.format(1, {} as any));
        Assert.throws(() => TimeConvert.format(1, [] as any));
    }
}
