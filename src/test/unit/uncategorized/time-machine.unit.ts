import {unit, test, Assert, Is, JsType} from "unit";
import {testBot} from "../TestBot";
import {TestStoreActionType, ITestState} from "../../../State/Store";
import {IStateCapsule} from "../../../State/TimeMachine";

@unit("Time Machine")
default class {
    @test("should have no initial state recorded")
    public noInitialState() {
        Assert.that(testBot.store.timeMachine.present(), Is.null);
    }

    @test("should return null when there are no records")
    public present_returnNullWhenNoRecords() {
        Assert.that(testBot.store.timeMachine.present(), Is.null);
    }

    @test("should return expected state capsule")
    public present_returnExpected() {
        testBot.store.dispatch<string>(TestStoreActionType.$$Test, "hello");

        const capsule: IStateCapsule<ITestState> = testBot.store.timeMachine.present() as IStateCapsule<ITestState>;

        Assert.that(capsule, Is.object);
        Assert.that(capsule.time, Is.number);
        Assert.that(capsule.state, Is.object);
        Assert.equal(capsule.state.$$test, "hello");
    }

    @test("should aggregate capsules before specified time")
    public before_aggregateBeforeTime() {
        const now: number = Date.now();
        const beforeNow1: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

        Assert.that(beforeNow1, Is.arrayWithLength(1));
        Assert.that(beforeNow1[0].time, Is.lessOrEqual(now));

        // Dispatch event.
        testBot.store.dispatch<string>(TestStoreActionType.$$Test, "world");

        const beforeNow2: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);
        const firstTest: string | undefined = beforeNow2[0].state.$$test;

        // Depending on the time (semi-fragile), one can come after another, or both at the same time.
        // TODO: Should verify all elements, not just the first one. (Possible is 1-2 elements).
        Assert.that(beforeNow2, Is.arrayOf(JsType.Object));
        Assert.true(beforeNow2.length === 1 || beforeNow2.length === 2);
        Assert.that(beforeNow2[0].state, Is.object);
        Assert.true(firstTest === "hello" || firstTest === "world");
        Assert.that(beforeNow2[0].time, Is.lessOrEqual(now));
    }

    @test("should aggregate capsules after specified time")
    public after_aggregateAfterTime() {
        const firstTime: number = (testBot.store.timeMachine.wayback() as IStateCapsule<ITestState>).time;
        const afterNow: IStateCapsule<ITestState>[] = testBot.store.timeMachine.after(firstTime);
        const firstTest: string | undefined = afterNow[0].state.$$test;

        // Depending on the time (semi-fragile), one can come after another, or both at the same time.
        // TODO: Should verify all elements, not just the first one. (Possible is 1-2 elements).
        Assert.that(afterNow, Is.arrayOf(JsType.Object));
        Assert.true(afterNow.length === 1 || afterNow.length === 2);
        Assert.that(afterNow[0].state, Is.object);
        Assert.true(firstTest === "hello" || firstTest === "world");
        Assert.that(afterNow[0].time, Is.greaterOrEqual(firstTime));
    }
}
