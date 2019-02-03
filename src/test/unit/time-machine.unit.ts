import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../test-bot";
import {TestStoreActionType, ITestState} from "../../state/store";
import {IStateCapsule} from "../../state/time-machine";

@Unit("Time Machine")
default class {
    @Test("should have no initial state recorded")
    public noInitialState() {
        Assert.that(testBot.store.timeMachine.present(), Is.null);
    }

    @Test("should return null when there are no records")
    public present_returnNullWhenNoRecords() {
        Assert.that(testBot.store.timeMachine.present(), Is.null);
    }

    @Test("should return expected state capsule")
    public present_returnExpected() {
        testBot.store.dispatch<string>(TestStoreActionType.$$Test, "hello");

        const capsule: IStateCapsule<ITestState> = testBot.store.timeMachine.present() as IStateCapsule<ITestState>;

        Assert.that(capsule, Is.object);
        Assert.that(capsule.time, Is.number);
        Assert.that(capsule.state, Is.object);
        Assert.equal(capsule.state.$$test, "hello");
    }

    @Test("should aggregate capsules before specified time")
    public before_aggregateBeforeTime() {
        const now: number = Date.now();
        const beforeNow1: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

        Assert.that(beforeNow1, Is.arrayWithLength(1));
        Assert.that(beforeNow1[0].time, Is.lessThan(now));

        // Dispatch event.
        testBot.store.dispatch<string>(TestStoreActionType.$$Test, "world");

        const beforeNow2: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

        Assert.that(beforeNow2, Is.arrayWithLength(1));
        Assert.that(beforeNow2[0], Is.object);
        Assert.that(beforeNow2[0].state, Is.object)
        Assert.equal(beforeNow2[0].state.$$test, "hello");
        Assert.that(beforeNow2[0].time, Is.lessThan(now));
    }

    @Test("should aggregate capsules after specified time")
    public after_aggregateAfterTime() {
        const firstTime: number = (testBot.store.timeMachine.wayback() as IStateCapsule<ITestState>).time;
        const afterNow: IStateCapsule<ITestState>[] = testBot.store.timeMachine.after(firstTime);

        Assert.that(afterNow, Is.arrayWithLength(1));
        Assert.that(afterNow[0].state, Is.object);
        Assert.equal(afterNow[0].state.$$test, "world");
        Assert.that(afterNow[0].time, Is.greaterThan(firstTime));
    }
}
