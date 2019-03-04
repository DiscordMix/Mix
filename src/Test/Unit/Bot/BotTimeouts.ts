import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../TestBot";

@Unit("Bot Timeouts & Intervals")
default class {
    @Test("should have no attached timeouts")
    public noTimeoutsSet() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @Test("should set timeouts")
    public setTimeouts() {
        return new Promise((resolve) => {
            testBot.setTimeout(() => {
                Assert.that(testBot.timeouts, Is.arrayWithLength(1));

                resolve();
            }, 1);
        });
    }

    @Test("should clear timeouts after executing")
    public clearTimeouts() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @Test("should have no attached intervals")
    public noIntervalsSet() {
        Assert.that(testBot.intervals, Is.emptyArray);
    }

    // TODO: More interval tests needed.
}
