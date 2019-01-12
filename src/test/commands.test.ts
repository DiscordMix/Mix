import {expect} from "chai";
import {testBot} from "./test-bot";

describe("Commands", () => {
    it("should register commands", () => {
        const actualCmds: string[] = ["hi"];
        const fakeCmds: string[] = ["john", "doe"];

        // Actual commands
        for (const actualCmd of actualCmds) {
            expect(testBot.commandStore.contains(actualCmd)).to.be.a("boolean").and.to.equal(true);
        }

        // Fake commands
        for (const fakeCmd of fakeCmds) {
            expect(testBot.commandStore.contains(fakeCmd)).to.be.a("boolean").and.to.equal(false);
        }

        // Other tests
        expect(testBot.commandStore.contains(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.commandStore.contains(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.commandStore.contains("" as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should not register invalid commands", async () => {
        const subjects: any[] = [true, false, null, undefined, "hello", "", "    ", 1, 0, -1, []];

        for (const subject of subjects) {
            expect(await testBot.commandStore.register(subject)).to.be.a("boolean").and.to.equal(false);
        }
    });
});
