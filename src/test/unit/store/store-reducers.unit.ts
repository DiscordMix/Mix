import {unit, test, Assert} from "unit";
import {testBot} from "../test-bot";
import {ITestState, Reducer, IStoreAction, TestStoreActionType} from "../../../state/store";
import TestUtils, {ExcludeParam} from "../test-utils";

const testReducer: Reducer<ITestState> = (action: IStoreAction, state?: ITestState): ITestState | null => {
    if (action.type === TestStoreActionType.$$Test && action.payload !== undefined && typeof action.payload === "string") {
        return {
            ...state,
            $$test: action.payload
        };
    }

    return null;
};

@unit("Store Reducers")
default class {
    @test("add(): should add reducers")
    public add_addReducers() {
        Assert.true(testBot.store.addReducer(testReducer));
    }

    @test("add(): should not add existing reducers")
    public add_notAddExisting() {
        Assert.false(testBot.store.addReducer(testReducer));
    }

    @test("add(): throw when passed invalid reducers")
    public add_throwOnInvalidReducers() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.addReducer(param));
        }
    }

    @test("dispatch(): should throw on invalid parameters")
    public dispatch_throwsOnInvalidParams() {
        // TODO: Takes 2 arguments.
        for (const param of TestUtils.makeParams([ExcludeParam.Number])) {
            Assert.throws(() => testBot.store.dispatch(param));
        }
    }

    @test("subscribe(): should subscribe handlers")
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

    @test("subscribe(): should throw on invalid parameters")
    public subscribe_throwOnInvalidParams() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.subscribe(param));
        }
    }

    @test("isSubscribed(): should determine if a handler is subscribed")
    public isSubscribed_determineIfSubscribed() {
        // TODO.
    }

    @test("isSubscribed(): should throw on invalid parameters")
    public isSubscribed_throwOnInvalidParams() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.isSubscribed(param));
        }
    }
}
