import {expect} from "chai";
import {InternalArgTypes, InternalArgResolvers} from "../core/constants";
import {testBot, init} from "./test-bot";

describe("Bot", () => {
    it("should init and login", async () => {
        await init();

        expect(testBot.client.user).to.be.an("object");
    });

    // TODO:
    /* it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
        expect(result.client.user).to.be.a("null");
    });

    it("should init and login using only token", async () => {
        testBot = new TestBot(token, true);

        await init();

        // Tests
        expect(testBot.client.user).to.be.an("object");
    }); */

    it("should not be suspended", () => {
        expect(testBot.suspended).to.be.a("boolean").and.to.equal(false);
    });

    it("should have no owner", () => {
        expect(testBot.owner).to.be.a("undefined");
    });

    it("should have no user groups", () => {
        expect(testBot.userGroups).to.be.an("array");
        expect(testBot.userGroups.length).to.be.a("number").and.to.equal(0);
    });

    it("should have default argument types", () => {
        expect(testBot.argumentTypes).to.be.an("array").and.to.equal(InternalArgTypes);
    });

    it("should have default argument resolvers", () => {
        expect(testBot.argumentResolvers).to.be.an("array").and.to.equal(InternalArgResolvers);
    });

    it("should not handle invalid messages", async () => {
        expect(await testBot.handleMessage(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage("" as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage("hello" as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage([] as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should have correct internal commands", () => {
        expect(testBot.internalCommands).to.be.an("array");
        expect(testBot.internalCommands.length).to.be.a("number").and.to.equal(3);
        expect(testBot.internalCommands[0]).to.be.a("string").and.to.equal("help");
        expect(testBot.internalCommands[1]).to.be.a("string").and.to.equal("usage");
        expect(testBot.internalCommands[2]).to.be.a("string").and.to.equal("ping");
    });

    describe("timeouts", () => {
        it("should have no timeouts set", () => {
            expect(testBot.timeouts.length).to.be.a("number").and.to.equal(0);
        });

        it("should set a timeout", () => {
            return new Promise((resolve) => {
                testBot.setTimeout(() => {
                    // Tests
                    expect(testBot.timeouts.length).to.be.a("number").and.to.equal(1);

                    resolve();
                }, 100);
            });
        });

        it("should clear timeouts after executing", () => {
            expect(testBot.timeouts.length).to.be.a("number").and.to.equal(0);
        });
    });

    describe("intervals", () => {
        it("should have no intervals set", () => {
            expect(testBot.intervals.length).to.be.a("number").and.to.equal(0);
        });

        // TODO: More tests
    });
});