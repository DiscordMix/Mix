import {expect} from "chai";
import assert = require("assert");
import {TestStoreActionType, IStoreAction, ITestState, Reducer} from "../state/store";
import {testBot} from "./test-bot";
import TestUtils, {ExcludeParam} from "./test-utils";

describe("Store", () => {
    it("should have undefined initial state", () => {
        expect(testBot.store.getState()).to.be.a("undefined");
    });

    it("should dispatch events", () => {
        return new Promise((resolve) => {
            testBot.store.subscribe((action: IStoreAction): void => {
                expect(action.type).to.equal(TestStoreActionType.$$Test);
                resolve();
            });

            testBot.store.dispatch(TestStoreActionType.$$Test);
        });
    });

    it("state should not be updated without payloads", () => {
        expect(testBot.store.getState()).to.be.a("undefined");
    });

    describe("addReducer()", () => {
        const testReducer: Reducer<ITestState> = (action: IStoreAction, state?: ITestState): ITestState | null => {
            if (action.type === TestStoreActionType.$$Test && action.payload !== undefined && typeof action.payload === "string") {
                return {
                    ...state,
                    $$test: action.payload
                };
            }

            return null;
        };

        it("should add reducers", () => {
            expect(testBot.store.addReducer(testReducer)).to.be.a("boolean").and.to.equal(true);
        });

        it("should not add existing reducers", () => {
            expect(testBot.store.addReducer(testReducer)).to.be.a("boolean").and.to.equal(false);
        });

        it("should throw when passed invalid reducers", () => {
            for (const param of TestUtils.makeParams()) {
                assert.throws(() => testBot.store.addReducer(param));
            }
        });
    });

    describe("dispatch()", () => {
        it("should throw on invalid parameters", () => {
            // TODO: Takes 2 arguments
            for (const param of TestUtils.makeParams([ExcludeParam.Number])) {
                assert.throws(() => testBot.store.dispatch(param));
            }
        });
    });

    describe("subscribe()", () => {
        it("should subscribe handlers", () => {
            return new Promise((resolve, reject) => {
                expect(testBot.store.subscribe((action: IStoreAction) => {
                    if (action.type === TestStoreActionType.$$Test) {
                        resolve();

                        return;
                    }

                    reject();
                })).to.be.a("boolean").and.to.equal(true);

                testBot.store.dispatch(TestStoreActionType.$$Test);
            });
        });

        it("should throw on invalid parameters", () => {
            for (const param of TestUtils.makeParams()) {
                assert.throws(() => testBot.store.subscribe(param));
            }
        });
    });

    describe("isSubscribed()", () => {
        it("should determine if a handler is subscribed", () => {
            // TODO
        });

        it("should throw on invalid parameters", () => {
            for (const param of TestUtils.makeParams()) {
                assert.throws(() => testBot.store.isSubscribed(param));
            }
        });
    });
});
