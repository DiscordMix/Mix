import {Unit, Test, Assert, Is, Target} from "unit";
import {testBot} from "../testBot";
import Store, {TestStoreActionType, IStoreAction} from "../../state/Store";

@Unit("Store")
default class {
    @Test("Should have undefined initial state")
    public initialState() {
        Assert.that(testBot.store.getState(), Is.undefined);
    }

    @Test("Should dispatch events")
    @Target(Store.prototype.dispatch)
    public dispatchEvents() {
        return new Promise((resolve) => {
            testBot.store.subscribe((action: IStoreAction): void => {
                Assert.equal(action.type, TestStoreActionType.$$Test);

                resolve();
            });

            testBot.store.dispatch(TestStoreActionType.$$Test);
        });
    }

    @Test("Should not update state without payloads")
    public noUpdateWithoutPayload() {
        Assert.that(testBot.store.getState(), Is.undefined);
    }
}
