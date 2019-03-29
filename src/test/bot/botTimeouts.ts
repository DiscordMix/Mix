import {unit, test, Assert, Is, target} from "unit";
import {testBot} from "../TestBot";
import Bot from "../../core/bot";

@unit("Bot Timeouts & Intervals")
default class {
    @test("should have no attached timeouts")
    public noTimeoutsSet() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @test("should set timeouts")
    @target(Bot.prototype.setTimeout)
    public setTimeouts() {
        return new Promise((resolve) => {
            testBot.setTimeout(() => {
                Assert.that(testBot.timeouts, Is.arrayWithLength(1));

                resolve();
            }, 1);
        });
    }

    @test("should clear timeouts after executing")
    public clearTimeouts() {
        Assert.that(testBot.timeouts, Is.emptyArray);
    }

    @test("should have no attached intervals")
    public noIntervalsSet() {
        Assert.that(testBot.intervals, Is.emptyArray);
    }

    // TODO: More interval tests needed.
}
