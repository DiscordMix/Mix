import {expect} from "chai";
import {testBot} from "./test-bot";

describe("Commands", () => {
    it("should register commands", () => {
        const actualCmds: string[] = ["hi"];
        const fakeCmds: string[] = ["john", "doe"]

        // Actual commands
        for (let i: number = 0; i < actualCmds.length; i++) {
            expect(testBot.commandStore.contains(actualCmds[i])).to.be.a("boolean").and.to.equal(true);
        }

        // Fake commands
        for (let i: number = 0; i < fakeCmds.length; i++) {
            expect(testBot.commandStore.contains(fakeCmds[i])).to.be.a("boolean").and.to.equal(false);
        }

        // Other tests
        expect(testBot.commandStore.contains(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.commandStore.contains(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.commandStore.contains("" as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should not register invalid commands", async () => {
        const subjects: any[] = [true, false, null, undefined, "hello", "", "    ", 1, 0, -1, []];

        for (let i: number = 0; i < subjects.length; i++) {
            expect(await testBot.commandStore.register(subjects[i])).to.be.a("boolean").and.to.equal(false);
        }
    });
});