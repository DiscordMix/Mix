import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../test-bot";
import {TestStoreActionType, IStoreAction} from "../../../state/store";

@Unit("Store")
default class {
    @Test("should have undefined initial state")
    public initialState() {
        Assert.that(testBot.store.getState(), Is.undefined);
    }

    @Test("should dispatch events")
    public dispatchEvents() {
        return new Promise((resolve) => {
            testBot.store.subscribe((action: IStoreAction): void => {
                Assert.equal(action.type, TestStoreActionType.$$Test);

                resolve();
            });

            testBot.store.dispatch(TestStoreActionType.$$Test);
        });
    }

    @Test("should not update state without payloads")
    public noUpdateWithoutPayload() {
        Assert.that(testBot.store.getState(), Is.undefined);
    }
}
