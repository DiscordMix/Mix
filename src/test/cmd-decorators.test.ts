import {testBot} from "./test-bot";
import {expect} from "chai";

describe("Command Decorators", () => {
    it("should register commands with helper decorators", () => {
        expect(testBot.commandStore.contains("test-decorator-command")).to.be.a("boolean").and.to.equal(true);
    });
});
