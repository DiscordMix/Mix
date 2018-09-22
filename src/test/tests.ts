import Utils from "../core/utils";
import Rgb from "../misc/rgb";
import Rgba from "../misc/rgba";
import Collection from "../collections/collection";
import ObjectProvider from "../data-providers/object-provider";
import Settings from "../core/settings";
import path from "path";
import {expect} from "chai";
import SwitchParser from "../commands/switch-parser";

const globalAny: any = global;
const describe: any = globalAny.describe;
const it: any = globalAny.it;

const subjects = {
    ids: [
        "<@285578743324606482>",
        "<#432269407654248459>",
        "285578743324606482"
    ],

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

describe("Utils.resolveId()", () => {
    it("should return the resolved ids", () => {
        // Review
        for (let i = 0; i < subjects.ids.length; i++) {
            const result = Utils.resolveId(subjects.ids[i]);

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