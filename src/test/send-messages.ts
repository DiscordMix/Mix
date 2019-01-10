import {Message} from "discord.js";
import {expect} from "chai";
import {testBot} from "./test-bot";

describe("Send Messages", () => {
    it("should send an embed message using ok()", async () => {
        const message: Message = await testBot.$sendEmbedMessageOk();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":white_check_mark: hello world");
    });

    it("should send an embed message using fail()", async () => {
        const message: Message = await testBot.$sendEmbedMessageFail();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(15158332); // Red
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":thinking: failed message");
    });

    it("should send an embed message using send()", async () => {
        const message: Message = await testBot.$sendEmbedMessageSend();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(0);
    });
});