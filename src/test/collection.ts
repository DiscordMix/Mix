import {TestSubjects} from "./test-bot";
import {expect} from "chai";
import Settings from "../core/settings";

describe("Collection", () => {
    describe("at()", () => {
        it("should return the item located in the specified index", () => {
            expect(TestSubjects.collection.at(0)).to.be.an("string").and.to.equal("hello");
            expect(TestSubjects.collection.at(1)).to.be.an("string").and.to.equal("it's me");
        });
    });

    describe("removeAt()", () => {
        it("should remove the item located in the specified index", () => {
            const result1 = TestSubjects.collection.removeAt(0);
            const result2 = TestSubjects.collection.removeAt(5);

            // Result 1
            expect(result1).to.be.an("boolean");
            expect(result1).to.equal(true);
            expect(TestSubjects.collection.at(0)).to.be.an("string");
            expect(TestSubjects.collection.at(0)).to.equal("it's me");

            // Result 2
            expect(result2).to.be.an("boolean");
            expect(result2).to.equal(false);
        });
    });

    describe("add()", () => {
        it("should add an item to the collection", () => {
            TestSubjects.collection.add("john doe");
            expect(TestSubjects.collection.at(0)).to.be.an("string").and.to.equal("it's me");
            expect(TestSubjects.collection.at(1)).to.be.an("object");
        });
    });

    describe("addUnique()", () => {
        it("should add an unique item", () => {
            expect(TestSubjects.collection.addUnique("doe")).to.be.an("boolean").and.to.equal(true);
            expect(TestSubjects.collection.addUnique("doe")).to.be.an("boolean").and.to.equal(false);
        });
    });

    describe("contains()", () => {
        it("should determine whether the collection contains an item", () => {
            expect(TestSubjects.collection.contains("john doe")).to.be.an("boolean").and.to.equal(true);
            expect(TestSubjects.collection.contains("nope")).to.be.an("boolean").and.to.equal(false);
        });
    });

    describe("find()", () => {
        it("should find an item by its property", () => {
            const result: any = TestSubjects.collection.find("name", "John Doe") as any;

            expect(result).to.be.an("object");
            expect(result.name).to.be.an("string").and.to.equal("John Doe");
        });
    });

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