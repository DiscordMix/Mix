import {expect} from "chai";
import assert = require("assert");
import BotMessages from "../core/messages";
import {TestStoreActionType, IStoreAction, ITestState, Reducer} from "../state/store";
import {testBot} from "./test-bot";

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

        it("should add a valid reducer", () => {
            expect(testBot.store.addReducer(testReducer)).to.be.a("boolean").and.to.equal(true);
        });

        it("should not add existing reducers", () => {
            expect(testBot.store.addReducer(testReducer)).to.be.a("boolean").and.to.equal(false);
        });

        it("should throw when passed invalid reducers", () => {
            assert.throws(() => testBot.store.addReducer(null as any));
            assert.throws(() => testBot.store.addReducer(undefined as any));
            assert.throws(() => testBot.store.addReducer([] as any));
            assert.throws(() => testBot.store.addReducer({} as any));
            assert.throws(() => testBot.store.addReducer("hello" as any));
            assert.throws(() => testBot.store.addReducer(0 as any));
            assert.throws(() => testBot.store.addReducer(1 as any));
            assert.throws(() => testBot.store.addReducer(true as any));
            assert.throws(() => testBot.store.addReducer(false as any));
        });
    });

    describe("dispatch()", () => {
        it("should throw on invalid parameters", () => {
            assert.throws(() => testBot.store.dispatch("test" as any));
            assert.throws(() => testBot.store.dispatch(undefined as any));
            assert.throws(() => testBot.store.dispatch(null as any));
            assert.throws(() => testBot.store.dispatch(false as any));
            assert.throws(() => testBot.store.dispatch(true as any));
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
            assert.throws(() => testBot.store.subscribe(1 as any));
            assert.throws(() => testBot.store.subscribe(0 as any));
            assert.throws(() => testBot.store.subscribe(false as any));
            assert.throws(() => testBot.store.subscribe(true as any));
            assert.throws(() => testBot.store.subscribe(null as any));
            assert.throws(() => testBot.store.subscribe(undefined as any));
            assert.throws(() => testBot.store.subscribe("hello" as any));
            assert.throws(() => testBot.store.subscribe({} as any));
            assert.throws(() => testBot.store.subscribe([] as any));
        });
    });

    describe("isSubscribed()", () => {
        it("should determine if a handler is subscribed", () => {
            // TODO
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => testBot.store.isSubscribed(true as any));
            assert.throws(() => testBot.store.isSubscribed(false as any));
            assert.throws(() => testBot.store.isSubscribed([] as any));
            assert.throws(() => testBot.store.isSubscribed({} as any));
            assert.throws(() => testBot.store.isSubscribed("hello" as any));
            assert.throws(() => testBot.store.isSubscribed(1 as any));
            assert.throws(() => testBot.store.isSubscribed(0 as any));
        });
    });
});