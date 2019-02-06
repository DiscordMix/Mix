import {unit, test, Assert, Is} from "unit";
import {testBot} from "../test-bot";
import Language, {LanguageSource} from "../../../language/language";

@unit("Languages")
default class {
    @test("should register languages")
    public register() {
        Assert.that(testBot.language, Is.object);

        const language: Language = testBot.language as Language;
        const languages: ReadonlyMap<string, LanguageSource> = language.getLanguages();

        Assert.equal(languages.size, 1);
        Assert.true(language.setDefault("test-language"));
        Assert.that((language as any).default, Is.object);
    }

    @test("should retrieve language values")
    public retrieveValues() {
        const language: Language = testBot.language as Language;

        Assert.equal(language.get("name"), "john doe");
        Assert.equal(language.get("occupation"), "tester");
    }

    @test("should not retrieve invalid language keys")
    public notRetrieveInvalid() {
        const language: Language = testBot.language as Language;

        Assert.that(language.get("fake"), Is.null);
        Assert.that(language.get(""), Is.null);
        Assert.that(language.get(null as any), Is.null);
        Assert.that(language.get(undefined as any), Is.null);
        Assert.that(language.get({} as any), Is.null);
        Assert.that(language.get([] as any), Is.null);
        Assert.that(language.get(3 as any), Is.null);
    }

    @test("should not set invalid default languages")
    public notSetInvalid() {
        const language: Language = testBot.language as Language;

        Assert.false(language.setDefault("f"));
        Assert.false(language.setDefault(""));
        Assert.false(language.setDefault(undefined as any));
        Assert.false(language.setDefault(null as any));
        Assert.false(language.setDefault(3 as any));
        Assert.false(language.setDefault({} as any));
        Assert.false(language.setDefault([] as any));
    }
}
