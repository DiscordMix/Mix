import {Unit, Test, Assert, Target} from "unit";
import {testBot} from "../TestBot";
import Store, {ITestState, Reducer, IStoreAction, TestStoreActionType} from "../../../State/Store";
import TestUtils, {ExcludeParam} from "../TestUtils";

const testReducer: Reducer<ITestState> = (action: IStoreAction, state?: ITestState): ITestState | null => {
    if (action.type === TestStoreActionType.$$Test && action.payload !== undefined && typeof action.payload === "string") {
        return {
            ...state,
            $$test: action.payload
        };
    }

    return null;
};

@Unit("Store Reducers")
default class {
    @Test("Should add reducers")
    @Target(Store.prototype.addReducer)
    public add_addReducers() {
        Assert.true(testBot.store.addReducer(testReducer));
    }

    @Test("Should not add existing reducers")
    @Target(Store.prototype.addReducer)
    public add_notAddExisting() {
        Assert.false(testBot.store.addReducer(testReducer));
    }

    @Test("Should throw when passed invalid reducers")
    @Target(Store.prototype.addReducer)
    public add_throwOnInvalidReducers() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.addReducer(param));
        }
    }

    @Test("Should throw on invalid parameters")
    @Target(Store.prototype.dispatch)
    public dispatch_throwsOnInvalidParams() {
        // TODO: Takes 2 arguments.
        for (const param of TestUtils.makeParams([ExcludeParam.Number])) {
            Assert.throws(() => testBot.store.dispatch(param));
        }
    }

    @Test("Should subscribe handlers")
    @Target(Store.prototype.subscribe)
    public subscribe_subscribeHandlers() {
        return new Promise((resolve, reject) => {
            Assert.true(testBot.store.subscribe((action: IStoreAction) => {
                if (action.type === TestStoreActionType.$$Test) {
                    resolve();

                    return;
                }

                reject();
            }));

            testBot.store.dispatch(TestStoreActionType.$$Test);
        });
    }

    @Test("Should throw on invalid parameters")
    @Target(Store.prototype.subscribe)
    public subscribe_throwOnInvalidParams() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.subscribe(param));
        }
    }

    @Test("Should determine if a handler is subscribed")
    @Target(Store.prototype.isSubscribed)
    public isSubscribed_determineIfSubscribed() {
        // TODO
    }

    @Test("Should throw on invalid parameters")
    @Target(Store.prototype.isSubscribed)
    public isSubscribed_throwOnInvalidParams() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.isSubscribed(param));
        }
    }
}
