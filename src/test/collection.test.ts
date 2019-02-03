import {expect} from "chai";
import Settings from "../core/settings";
import {TestSubjects} from "./test-bot";

describe("Collection", () => {
    describe("fromFile()", () => {
        it("should load settings from a file", () => {
            const settingsPromise: Promise<Settings> = new Promise(async (resolve) => {
                resolve(await Settings.fromFile(TestSubjects.settingsPath));
            });

            const settingsSecondPromise: Promise<Settings> = new Promise(async (resolve) => {
                resolve(await Settings.fromFile(TestSubjects.settingsPathTwo));
            });

            settingsPromise.then((result: Settings) => {
                expect(result.general.prefix).to.be.an("array");
                expect(result.general.prefix[0]).to.equal("!");
                expect(result.general.token).to.be.an("string").and.to.equal("my_secret_token");
                expect(result.paths.commands).to.be.an("string").and.to.equal("./my_commands");
                expect(result.paths.plugins).to.be.an("string").and.to.equal("./my_plugins");
                expect(result.keys.dbl).to.be.an("string").and.to.equal("my_dbl_key");
                expect(result.keys.bfd).to.be.an("string").and.to.equal("my_bfd_key");
            });

            return settingsSecondPromise.then((result: Settings) => {
                expect(result.general.prefix).to.be.an("array");
                expect(result.general.prefix[0]).to.equal(".");
                expect(result.general.token).to.be.an("string").and.to.equal("another_secret_token");

                // TODO: Use default paths reference instead of being hard-coded
                expect(result.paths.commands).to.be.an("string").and.to.equal("commands");
                expect(result.paths.plugins).to.be.an("string").and.to.equal("plugins");
            });
        });
    });
});
