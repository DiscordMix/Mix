import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../test-bot";

@Unit("Bot Timeouts & Intervals")
default class {
    @Test("have no attached timeouts")
    public noTimeoutsSet() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @Test("set timeouts")
    public setTimeouts() {
        return new Promise((resolve) => {
            testBot.setTimeout(() => {
                Assert.that(testBot.timeouts, Is.arrayWithLength(1));

                resolve();
            }, 1);
        });
    }

    @Test("clear timeouts after executing")
    public clearTimeouts() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @Test("have no attached intervals")
    public noIntervalsSet() {
        Assert.that(testBot.intervals, Is.emptyArray);
    }

    // TODO: More interval tests needed.
}
