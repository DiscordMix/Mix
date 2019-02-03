import {Message} from "discord.js";
import {expect} from "chai";
import {testBot} from "./unit/test-bot";
import TestUtils from "./test-utils";

describe("Long Messages", () => {
    it("should trim long messages", async () => {
        const randomStr: string = TestUtils.randomStringX(50);
        const message: Message = await testBot.$longMessages(randomStr);

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0]).to.be.an("object");
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":white_check_mark: " + randomStr.substring(0, 1024 - 19 - 4) + " ...");
    });
});
