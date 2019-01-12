import {expect} from "chai";
import {testBot} from "./test-bot";
import TestUtils, {ExcludeParam} from "./test-utils";

describe("Services", () => {
    it("should register services", () => {
        expect(testBot.services.contains("test")).to.be.a("boolean").and.to.equal(true);

        for (const item of TestUtils.makeParams(["test"])) {
            expect(testBot.services.contains(item)).to.be.a("boolean").and.to.equal(false);
        }

        expect(testBot.services.getAll().size).to.be.a("number").and.to.equal(3);
    });

    it("should not register invalid services", () => {
        for (const param of TestUtils.makeParams([ExcludeParam.Object])) {
            expect(testBot.services.register(param)).to.be.a("boolean").and.to.equal(false);
        }
    });

    it("should not enable invalid services", async () => {
        // TODO: Append another string that is not "test"
        for (const param of TestUtils.makeParams(["test"])) {
            expect(await testBot.services.start(param)).to.be.a("boolean").and.to.equal(false);
        }
    });

    it("should be able to retrieve services", () => {
        expect(testBot.services.getService("test")).to.be.an("object");
    });

    it("should not be able to retrieve invalid services", () => {
        // TODO: Append another string that is not "test"
        for (const param of TestUtils.makeParams(["test"])) {
            expect(testBot.services.getService(param)).to.be.a("null");
        }
    });
});
