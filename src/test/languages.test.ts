import {expect} from "chai";
import Language, {LanguageSource} from "../language/language";
import {testBot} from "./test-bot";

describe("Languages", () => {
    it("should register languages", () => {
        expect(testBot.language).to.be.an("object");

        const language: Language = testBot.language as Language;
        const languages: ReadonlyMap<string, LanguageSource> = language.getLanguages();

        expect(languages.size).to.be.a("number").and.to.equal(1);
        expect(language.setDefault("test-language")).to.be.a("boolean").and.to.equal(true);
        expect((language as any).default).to.be.an("object");
    });

    it("should return language values", () => {
        const language: Language = testBot.language as Language;

        expect(language.get("name")).to.be.a("string").and.to.equal("john doe");
        expect(language.get("occupation")).to.be.a("string").and.to.equal("tester");
    });

    it("should not return invalid language keys", () => {
        const language: Language = testBot.language as Language;

        expect(language.get("fake")).to.be.a("null");
        expect(language.get("")).to.be.a("null");
        expect(language.get(null as any)).to.be.a("null");
        expect(language.get(undefined as any)).to.be.a("null");
        expect(language.get({} as any)).to.be.a("null");
        expect(language.get([] as any)).to.be.a("null");
        expect(language.get(3 as any)).to.be.a("null");
    });

    it("should not set invalid default languages", () => {
        const language: Language = testBot.language as Language;

        expect(language.setDefault("f")).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault("")).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault(3 as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault({} as any)).to.be.a("boolean").and.to.equal(false);
        expect(language.setDefault([] as any)).to.be.a("boolean").and.to.equal(false);
    });
});
