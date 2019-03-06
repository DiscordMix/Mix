import {Unit, Test, Assert, Is, Target} from "unit";
import {testBot} from "../TestBot";
import Bot from "../../../Core/Bot";

@Unit("Bot Timeouts & Intervals")
default class {
    @Test("Should have no attached timeouts")
    public noTimeoutsSet() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @Test("Should set timeouts")
    @Target(Bot.prototype.setTimeout)
    public setTimeouts() {
        return new Promise((resolve) => {
            testBot.setTimeout(() => {
                Assert.that(testBot.timeouts, Is.arrayWithLength(1));

                resolve();
            }, 1);
        });
    }

    @Test("Should clear timeouts after executing")
    public clearTimeouts() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @Test("Should have no attached intervals")
    public noIntervalsSet() {
        Assert.that(testBot.intervals, Is.emptyArray);
    }

    // TODO: More interval tests needed.
}
