import {Unit, Test, Assert} from "unit";
import {testBot} from "../test-bot";
import {ITestState, Reducer, IStoreAction, TestStoreActionType} from "../../state/store";
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

@Unit("Store Reducers")
default class {
    @Test("add(): should add reducers")
    public add() {
        Assert.true(testBot.store.addReducer(testReducer));
    }

    @Test("add(): should not add existing reducers")
    public notAddExisting() {
        Assert.false(testBot.store.addReducer(testReducer));
    }

    @Test("add(): throw when passed invalid reducers")
    public throwOnInvalidReducers() {
        for (const param of TestUtils.makeParams()) {
            Assert.throws(() => testBot.store.addReducer(param));
        }
    }

    @Test("dispatch(): should throw on invalid parameters")
    public dispatchThrowsOnInvalidParams() {
        // TODO: Takes 2 arguments.
        for (const param of TestUtils.makeParams([ExcludeParam.Number])) {
            Assert.throws(() => testBot.store.dispatch(param));
        }
    }
}
