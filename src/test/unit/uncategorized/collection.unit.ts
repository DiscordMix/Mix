import {unit, test, Assert, Is} from "unit";
import {TestSubjects} from "../test-bot";
import Settings from "../../../core/settings";

@unit("Collection")
default class {
    @test("at(): should return the item located in the specified index")
    public at() {
        Assert.equal(TestSubjects.collection.at(0), "hello");
        Assert.equal(TestSubjects.collection.at(1), "it's me");
    }

    @test("removeAt(): should remove the item located in the specified index")
    public removeAt() {
        const result1: boolean = TestSubjects.collection.removeAt(0);
        const result2: boolean = TestSubjects.collection.removeAt(5);

        Assert.true(result1);
        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.false(result2);
    }

    @test("add(): should add an item to the collection")
    public add() {
        TestSubjects.collection.add("test");

        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.that(TestSubjects.collection.at(1), Is.object);
    }

    @test("addUnique(): should add an unique item")
    public addUnique() {
        Assert.true(TestSubjects.collection.addUnique("doe"));
        Assert.false(TestSubjects.collection.addUnique("doe"));
    }

    @test("contains(): should determine whether the collection contains an item")
    public contains() {
        Assert.true(TestSubjects.collection.contains("doe"));
        Assert.false(TestSubjects.collection.contains("nope"));
    }

    @test("find(): should find an item by its property")
    public find() {
        const result: any = TestSubjects.collection.find("name", "John Doe");

        Assert.that(result, Is.object);
        Assert.equal(result.name, "John Doe");
    }

    @test("fromFile(): should load settings from a file")
    public async fromFile_loadSettings() {
        const settingsPromise: Promise<Settings> = new Promise(async (resolve) => {
            resolve(await Settings.fromFile(TestSubjects.settingsPath));
        });

        const settingsSecondPromise: Promise<Settings> = new Promise(async (resolve) => {
            resolve(await Settings.fromFile(TestSubjects.settingsPathTwo));
        });

        settingsPromise.then((result: Settings) => {
            Assert.that(result.general.prefix, Is.array);

            Assert.equal(result.general.prefix[0], "!");
            Assert.equal(result.general.token, "my_secret_token");
            Assert.equal(result.paths.commands, "./my_commands");
            Assert.equal(result.paths.plugins, "./my_plugins");
            Assert.equal(result.keys.dbl, "my_dbl_key");
            Assert.equal(result.keys.bfd, "my_bfd_key");
        });

        const result1 = await settingsSecondPromise;

        Assert.that(result1.general.prefix, Is.array);
        Assert.equal(result1.general.prefix[0], ".");
        Assert.equal(result1.general.token, "another_secret_token");

        // TODO: Use default paths reference instead of being hard-coded
        Assert.equal(result1.paths.commands, "commands");
        Assert.equal(result1.paths.plugins, "plugins");
    }
}
