import {expect} from "chai";
import {testBot} from "./test-bot";

describe("Services", () => {
    it("should register services", () => {
        expect(testBot.services.contains("test")).to.be.a("boolean").and.to.equal(true);
        expect(testBot.services.contains("fake")).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.getAll().size).to.be.a("number").and.to.equal(3);
    });

    it("should not register invalid services", () => {
        expect(testBot.services.register([] as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(["hello"] as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register("" as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register("hello" as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(3 as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should not enable invalid services", async () => {
        expect(await testBot.services.start("fake")).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start("")).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(3 as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start({} as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start([] as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(["hello"] as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should be able to retrieve services", () => {
        expect(testBot.services.getService("test")).to.be.an("object");
    });

    it("should not be able to retrieve invalid services", () => {
        expect(testBot.services.getService("fake")).to.be.a("null");
        expect(testBot.services.getService("")).to.be.a("null");
        expect(testBot.services.getService({} as any)).to.be.a("null");
        expect(testBot.services.getService([] as any)).to.be.a("null");
        expect(testBot.services.getService(undefined as any)).to.be.a("null");
        expect(testBot.services.getService(null as any)).to.be.a("null");
        expect(testBot.services.getService(["hello"] as any)).to.be.a("null");
        expect(testBot.services.getService(3 as any)).to.be.a("null");
    });
});