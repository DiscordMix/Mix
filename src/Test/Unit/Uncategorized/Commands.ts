import {Unit, Test, Assert} from "unit";
import {testBot} from "../TestBot";

@Unit("Commands")
default class {
    @Test("Should register commands")
    public register() {
        const actualCmds: string[] = ["hi"];
        const fakeCmds: string[] = ["john", "doe"];

        // Actual commands.
        for (const actualCmd of actualCmds) {
            Assert.true(testBot.registry.contains(actualCmd));
        }

        // Fake commands.
        for (const fakeCmd of fakeCmds) {
            Assert.false(testBot.registry.contains(fakeCmd));
        }

        // Other tests.
        Assert.false(testBot.registry.contains(undefined as any));
        Assert.false(testBot.registry.contains(null as any));
        Assert.false(testBot.registry.contains("" as any));
    }

    @Test("Should not register invalid commands")
    public async notRegisterInvalid() {
        const subjects: any[] = [true, false, null, undefined, "hello", "", "    ", 1, 0, -1, []];

        for (const subject of subjects) {
            Assert.false(await testBot.registry.register(subject));
        }
    }
}
