import {expect} from "chai";
import {IStateCapsule} from "../state/time-machine";
import assert = require("assert");
import {TestStoreActionType, ITestState} from "../state/store";
import Bot from "../core/bot";
import {testBot} from "./test-bot";

describe("Time Machine", () => {
    it("should have no initial state recorded", () => {
        expect(testBot.store.timeMachine.present()).to.be.a("null");
    });

    describe("present()", () => {
        it("should return null when there are no records", () => {
            expect(testBot.store.timeMachine.present()).to.be.a("null");
        });

        it("should return expected state capsule", () => {
            testBot.store.dispatch<string>(TestStoreActionType.$$Test, "hello");

            const capsule: IStateCapsule<ITestState> = testBot.store.timeMachine.present() as IStateCapsule<ITestState>;

            expect(capsule).to.be.an("object");
            expect(capsule.time).to.be.a("number");
            expect(capsule.state).to.be.an("object");
            expect(capsule.state.$$test).to.be.a("string");
            expect(capsule.state.$$test).to.equal("hello");
        });
    });

    describe("before()", () => {
        it("should aggregate capsules before specified time", () => {
            const now: number = Date.now();
            const beforeNow1: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

            expect(beforeNow1).to.be.an("array").and.to.have.length(1);
            expect(beforeNow1[0].time).to.be.a("number").and.to.be.lessThan(now);

            testBot.store.dispatch<string>(TestStoreActionType.$$Test, "world");

            const beforeNow2: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

            expect(beforeNow2).to.be.an("array").and.to.have.length(1);
            expect(beforeNow2[0]).to.be.an("object");
            expect(beforeNow2[0].state).to.be.an("object");
            expect(beforeNow2[0].state.$$test).to.be.a("string").and.to.equal("hello");
            expect(beforeNow2[0].time).to.be.a("number").and.to.be.lessThan(now);
        });
    });

    describe("after()", () => {
        it("should aggregate capsules after specified time", () => {
            const firstTime: number = (testBot.store.timeMachine.wayback() as IStateCapsule<ITestState>).time;
            const afterNow: IStateCapsule<ITestState>[] = testBot.store.timeMachine.after(firstTime);

            expect(afterNow).to.be.an("array").and.to.have.length(1);
            expect(afterNow[0].state).to.be.an("object");
            expect(afterNow[0].state.$$test).to.be.a("string").and.to.equal("world");
            expect(afterNow[0].time).to.be.a("number").and.to.be.greaterThan(firstTime);
        });
    });
});

describe("Restart", () => {
    it("should restart without throwing", () => {
        return new Promise((resolve) => {
            assert.doesNotThrow(async () => {
                await testBot.restart(false);

                resolve();
            });
        });
    });
});

describe("Disconnect", () => {
    it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
        expect(result.client.user).to.be.a("null");
    });
});
