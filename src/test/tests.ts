import Utils from "../core/utils";
import Rgb from "../misc/rgb";
import Rgba from "../misc/rgba";
import Collection from "../collections/collection";
import ObjectProvider from "../data-providers/object-provider";
import Settings from "../core/settings";
import path from "path";
import {expect} from "chai";
import SwitchParser from "../commands/switch-parser";
import * as assert from "assert";

const globalAny: any = global;
const describe: any = globalAny.describe;
const it: any = globalAny.it;

const subjects = {
    ids: [
        "<@285578743324606482>",
        "<#432269407654248459>",
        "<&457741550970077195>",
        "285578743324606482"
    ],

    token: "NDMzMzg0MzM1MjExNjI2NDk4.DqrIbQ.cC0MAvHKTwbOVrPEa-Xddz356vc",

    rgb: new Rgb(5, 10, 15),

    rgba: new Rgba({
        red: 5,
        green: 10,
        blue: 15,
        alpha: 1
    }),

    collection: new Collection(["hello", "it's me", {
        name: "John Doe"
    }]),

    objAdapter: new ObjectProvider({
        person: {
            doe: {
                name: "John Doe"
            }
        }
    }),

    settingsPath: path.resolve(path.join(__dirname, "./../../src/test/test-settings.json")),

    settingsPathTwo: path.resolve(path.join(__dirname, "./../../src/test/test-settings-2.json")),

    switches: {
        short: "base arg -h",
        long: "base arg --help",
        longValue: "base --help=hello",
        longQuotedValue: 'base --help="hello world"',
        multiple: "base arg -h -q --hello --world",
        multipleValues: "base arg -h -q --hello=world --world=hello",
        multipleQuotedValues: 'base arg -h -q --hello="world hello" --world="hello world"'
    }
};

describe("Utils.isEmpty()", () => {
    it ("should return whether the input is empty", () => {
        const result1: boolean = Utils.isEmpty("");
        const result2: boolean = Utils.isEmpty(undefined);
        const result3: boolean = Utils.isEmpty("     ");
        const result4: boolean = Utils.isEmpty("   hello world   ");
        const result5: boolean = Utils.isEmpty(null);
        const result6: boolean = Utils.isEmpty(0);
        const result7: boolean = Utils.isEmpty(false);
        const result8: boolean = Utils.isEmpty([]);
        const result9: boolean = Utils.isEmpty(["hello"]);

        expect(result1).to.equal(true);
        expect(result2).to.equal(true);
        expect(result3).to.equal(true);
        expect(result4).to.equal(false);
        expect(result5).to.equal(true);
        expect(result6).to.equal(false);
        expect(result7).to.equal(false);
        expect(result8).to.equal(true);
        expect(result9).to.equal(false);
    });
});

describe("Utils.hasMentionPrefix()", () => {
    it ("should return whether the text provided start with a mention", () => {
        const result1: boolean = Utils.hasMentionPrefix(`<@${subjects.ids[0]}> hello world`, subjects.ids[0]);
        const result2: boolean = Utils.hasMentionPrefix(`hello world <@${subjects.ids[0]}>`, subjects.ids[0]);

        expect(result1).to.equal(true);
        expect(result2).to.equal(false);
    });

    it("should throw an error when provided invalid input", () => {
        assert.throws(() => Utils.hasMentionPrefix(undefined as any, undefined as any));
        assert.throws(() => Utils.hasMentionPrefix(null as any, null as any));
        assert.throws(() => Utils.hasMentionPrefix(4 as any, 543 as any));
        assert.throws(() => Utils.hasMentionPrefix({} as any, "hello world"));
    });
});

describe("Utils.escapeText()", () => {
    it("should escape tokens", () => {
        const result1: string = Utils.escapeText(subjects.token, subjects.token);
        const result2: string = Utils.escapeText("hi world, hello world, john doe", "hello world");
        const result3: string = Utils.escapeText(`hi world, ${subjects.token}, john doe`, "hello world");
        const result4: string = Utils.escapeText(`hi world, ${subjects.token}, john doe, hello world, hi`, "hello world");

        expect(result1).to.equal("[Token]");
        expect(result2).to.equal("hi world, [Token], john doe");
        expect(result3).to.equal("hi world, [Token], john doe");
        expect(result4).to.equal("hi world, [Token], john doe, [Token], hi");
    });

    it("should escape IPv4s", () => {
        const result1: string = Utils.escapeText("192.168.0.1", "empty");
        const result2: string = Utils.escapeText("53.32.53.252", "empty");
        const result3: string = Utils.escapeText("hello 192.168.0.1 world", "empty");

        expect(result1).to.equal("[IPv4]");
        expect(result2).to.equal("[IPv4]");
        expect(result3).to.equal("hello [IPv4] world");
    });

    it("should escape mentions", () => {
        const result1: string = Utils.escapeText("@everyone hello world", "empty");
        const result2: string = Utils.escapeText("hello @everyone world", "empty");
        const result3: string = Utils.escapeText("@here hello world", "empty");
        const result4: string = Utils.escapeText("hello @here world", "empty");
        const result5: string = Utils.escapeText("hello @here world @everyone john", "empty");
        const result6: string = Utils.escapeText("@herehello @here world@everyonejohn", "empty");
        const result7: string = Utils.escapeText(`hello ${subjects.ids[0]} world`, "empty");
        const result8: string = Utils.escapeText(`hello ${subjects.ids[1]} world`, "empty");
        const result9: string = Utils.escapeText(`hello ${subjects.ids[2]} world`, "empty");
        const result10: string = Utils.escapeText(`hello ${subjects.ids[3]} world`, "empty");

        expect(result1).to.equal("[Mention] hello world");
        expect(result2).to.equal("hello [Mention] world");
        expect(result3).to.equal("[Mention] hello world");
        expect(result4).to.equal("hello [Mention] world");
        expect(result5).to.equal("hello [Mention] world [Mention] john");
        expect(result6).to.equal("[Mention]hello [Mention] world[Mention]john");
        expect(result7).to.equal("hello [Mention] world");
        expect(result8).to.equal("hello [Mention] world");
        expect(result9).to.equal("hello [Mention] world");
        expect(result10).to.equal(`hello ${subjects.ids[3]} world`);
    });

    it("should throw when provided invalid input", () => {
        assert.throws(() => Utils.escapeText(undefined as any, undefined as any));
        assert.throws(() => Utils.escapeText(null as any, null as any));
        assert.throws(() => Utils.escapeText(undefined as any, null as any));
        assert.throws(() => Utils.escapeText(null as any, undefined as any));
        assert.throws(() => Utils.escapeText({} as any, 465 as any));
        assert.throws(() => Utils.escapeText(52 as any, {} as any));
    });
});

describe("Utils.resolveId()", () => {
    it("should return the resolved ids", () => {
        // Review
        for (let i = 0; i < subjects.ids.length; i++) {
            const result: any = Utils.resolveId(subjects.ids[i]);

            expect(result).to.be.an("string");
            expect(result).to.have.lengthOf(18);
        }
    });
});

describe("Utils.timeAgo()", () => {
    it("should return a string", () => {
        expect(Utils.timeAgo(Date.now())).to.be.an("string");
    });
});

describe("Utils.getRandomInt()", () => {
    it("should return a random number", () => {
        const result = Utils.getRandomInt(0, 2);

        expect(result).to.be.an("number");
        // TODO: Check to be the number either 0 or 1
    });
});

describe("Utils.translateState()", () => {
    it("should return the translated state", () => {
        const subjects = [
            true,
            1,
            "y",
            "yes",
            "on"
        ];

        for (let i = 0; i < subjects.length; i++) {
            const result = Utils.translateState(subjects[i].toString());

            expect(result).to.be.an("boolean");
            expect(result).to.be.equal(true);
        }
    });
});

describe("Utils.timeFromNow()", () => {
    it("should return the time from now in milliseconds", () => {
        const result = Utils.timeFromNow(0, 0, 50);

        expect(result).to.be.an("number");
        expect(result.toString()).to.have.lengthOf(13);
    });
});

describe("Utils.shuffle()", () => {
    it("should shuffle an array", () => {
        const result = Utils.shuffle(["hello", "my", "name", "is", "john doe"]);

        expect(result).to.be.an("array");
        expect(result.join(" ")).to.not.equal("hello my name is john doe");
    });
});

describe("Rgb.toString()", () => {
    it("should return the Rgb in string format", () => {
        const result = subjects.rgb.toString();

        expect(result).to.be.an("string");
        expect(result).to.equal("5, 10, 15");
    });
});

describe("Rgba.toString()", () => {
    it("should return the Rgba in string format", () => {
        const result = subjects.rgba.toString();

        expect(result).to.be.an("string");
        expect(result).to.equal("5, 10, 15, 1");
    });
});

describe("Collection.at()", () => {
    it("should return the item located in the specified index", () => {
        const result1 = subjects.collection.at(0);
        const result2 = subjects.collection.at(1);

        // Result 1
        expect(result1).to.be.an("string");
        expect(result1).to.equal("hello");

        // Result 2
        expect(result2).to.be.an("string");
        expect(result2).to.equal("it's me");
    });
});

describe("Collection.removeAt()", () => {
    it("should remove the item located in the specified index", () => {
        const result1 = subjects.collection.removeAt(0);
        const result2 = subjects.collection.removeAt(5);

        // Result 1
        expect(result1).to.be.an("boolean");
        expect(result1).to.equal(true);
        expect(subjects.collection.at(0)).to.be.an("string");
        expect(subjects.collection.at(0)).to.equal("it's me");

        // Result 2
        expect(result2).to.be.an("boolean");
        expect(result2).to.equal(false);
    });
});

describe("Collection.add()", () => {
    it("should add an item to the collection", () => {
        subjects.collection.add("john doe");
        expect(subjects.collection.at(0)).to.be.an("string");
        expect(subjects.collection.at(0)).to.equal("it's me");
        expect(subjects.collection.at(1)).to.be.an("object");
    });
});

describe("Collection.addUnique()", () => {
    it("should add an unique item", () => {
        const result1 = subjects.collection.addUnique("doe");
        const result2 = subjects.collection.addUnique("doe");

        // Result 1
        expect(result1).to.be.an("boolean");
        expect(result1).to.equal(true);

        // Result 2
        expect(result2).to.be.an("boolean");
        expect(result2).to.equal(false);
    });
});

describe("Collection.contains()", () => {
    it("should determine whether the collection contains an item", () => {
        const result1 = subjects.collection.contains("john doe");
        const result2 = subjects.collection.contains("nope");

        // Result 1
        expect(result1).to.be.an("boolean");
        expect(result1).to.equal(true);

        // Result 2
        expect(result2).to.be.an("boolean");
        expect(result2).to.equal(false);
    });
});

describe("Collection.find()", () => {
    it("should find an item by its property", () => {
        const result = subjects.collection.find("name", "John Doe");

        expect(result).to.be.an("object");
        expect(result.name).to.be.an("string");
        expect(result.name).to.equal("John Doe");
    });
});

describe("ObjectProvider.get()", () => {
    it("should return the item in the specified path", () => {
        const result = subjects.objAdapter.get("person.doe");

        expect(result).to.be.an("object");
        expect(result.name).to.be.an("string");
        expect(result.name).to.equal("John Doe");
    });
});

describe("ObjectProvider.set()", () => {
    it("should set data in the item at the specified path", () => {
        subjects.objAdapter.set("person.doe.name", "Doe John");

        const result = subjects.objAdapter.get("person.doe.name");

        expect(result).to.be.an("string");
        expect(result).to.equal("Doe John");
    });
});

describe("Settings.fromFile()", () => {
    it("should load settings from a file", () => {
        const settingsPromise: Promise<Settings> = new Promise(async (resolve) => {
            resolve(await Settings.fromFile(subjects.settingsPath));
        });

        const settingsSecondPromise: Promise<Settings> = new Promise(async (resolve) => {
            resolve(await Settings.fromFile(subjects.settingsPathTwo));
        });

        settingsPromise.then((result: Settings) => {
            expect(result.general.prefixes).to.be.an("array");
            expect(result.general.prefixes[0]).to.equal("!");

            expect(result.general.token).to.be.an("string");
            expect(result.general.token).to.equal("my_secret_token");

            expect(result.paths.commands).to.be.an("string");
            expect(result.paths.commands).to.equal("./my_commands");

            expect(result.paths.plugins).to.be.an("string");
            expect(result.paths.plugins).to.equal("./my_plugins");

            expect(result.keys.dbl).to.be.an("string");
            expect(result.keys.dbl).to.equal("my_dbl_key");

            expect(result.keys.bfd).to.be.an("string");
            expect(result.keys.bfd).to.equal("my_bfd_key");
        });

        return settingsSecondPromise.then((result: Settings) => {
            expect(result.general.prefixes).to.be.an("array");
            expect(result.general.prefixes[0]).to.equal(".");

            expect(result.general.token).to.be.an("string");
            expect(result.general.token).to.equal("another_secret_token");

            expect(result.paths.commands).to.be.an("string");
            expect(result.paths.commands).to.equal("./commandStore");

            expect(result.paths.plugins).to.be.an("string");
            expect(result.paths.plugins).to.equal("./plugins");
        });
    });
});

describe("SwitchParser.getSwitches()", () => {
    it("parse command switches", () => {
        const result1 = SwitchParser.getSwitches(subjects.switches.short);
        const result2 = SwitchParser.getSwitches(subjects.switches.long);
        const result3 = SwitchParser.getSwitches(subjects.switches.longValue);
        const result4 = SwitchParser.getSwitches(subjects.switches.longQuotedValue);
        const result5 = SwitchParser.getSwitches(subjects.switches.multiple);
        const result6 = SwitchParser.getSwitches(subjects.switches.multipleValues);
        const result7 = SwitchParser.getSwitches(subjects.switches.multipleQuotedValues);

        for (let i = 0; i < result1.length; i++) {
            expect(result1[0]).to.be.an("object");
        }

        // Short
        expect(result1[0].key).to.equal("h");
        expect(result1[0].short).to.equal(true);
        expect(result1[0].value).to.equal(null);

        // Long
        expect(result2[0].key).to.equal("help");
        expect(result2[0].short).to.equal(false);
        expect(result2[0].value).to.equal(null);

        // Long Value
        expect(result3[0].key).to.equal("help");
        expect(result3[0].short).to.equal(false);
        expect(result3[0].value).to.equal("hello");

        // Long Quoted Value
        expect(result4[0].key).to.equal("help");
        expect(result4[0].short).to.equal(false);
        expect(result4[0].value).to.equal("hello world");

        // Multiple -> -h
        expect(result5[0].key).to.equal("h");
        expect(result5[0].short).to.equal(true);
        expect(result5[0].value).to.equal(null);

        // Multiple -> -q
        expect(result5[1].key).to.equal("q");
        expect(result5[1].short).to.equal(true);
        expect(result5[1].value).to.equal(null);

        // Multiple -> --hello
        expect(result5[2].key).to.equal("hello");
        expect(result5[2].short).to.equal(false);
        expect(result5[2].value).to.equal(null);

        // Multiple -> --world
        expect(result5[3].key).to.equal("world");
        expect(result5[3].short).to.equal(false);
        expect(result5[3].value).to.equal(null);

        // Multiple Values -> -h
        expect(result6[0].key).to.equal("h");
        expect(result6[0].short).to.equal(true);
        expect(result6[0].value).to.equal(null);

        // Multiple Values -> -q
        expect(result6[1].key).to.equal("q");
        expect(result6[1].short).to.equal(true);
        expect(result6[1].value).to.equal(null);

        // Multiple Values -> --hello
        expect(result6[2].key).to.equal("hello");
        expect(result6[2].short).to.equal(false);
        expect(result6[2].value).to.equal("world");

        // Multiple Values -> --world
        expect(result6[3].key).to.equal("world");
        expect(result6[3].short).to.equal(false);
        expect(result6[3].value).to.equal("hello");

        // Multiple Quoted Values -> -h
        expect(result7[0].key).to.equal("h");
        expect(result7[0].short).to.equal(true);
        expect(result7[0].value).to.equal(null);

        // Multiple Quoted Values -> -q
        expect(result7[1].key).to.equal("q");
        expect(result7[1].short).to.equal(true);
        expect(result7[1].value).to.equal(null);

        // Multiple Quoted Values -> --hello="world hello"
        expect(result7[2].key).to.equal("hello");
        expect(result7[2].short).to.equal(false);
        expect(result7[2].value).to.equal("world hello");

        // Multiple Quoted Values -> --world="hello world"
        expect(result7[3].key).to.equal("world");
        expect(result7[3].short).to.equal(false);
        expect(result7[3].value).to.equal("hello world");
    });
});
