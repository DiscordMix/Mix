import {expect} from "chai";
import assert = require("assert");
import {TestStoreActionType, IStoreAction, ITestState, Reducer} from "../state/store";
import {testBot} from "./test-bot";
import TestUtils, {ExcludeParam} from "./test-utils";

describe("Store", () => {
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
            // TODO.
        });

        it("should throw on invalid parameters", () => {
            for (const param of TestUtils.makeParams()) {
                assert.throws(() => testBot.store.isSubscribed(param));
            }
        });
    });
});
