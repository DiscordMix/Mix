// Environment variables
require("dotenv").config();

import Settings from "../core/settings";
import {Snowflake, Guild, TextChannel, Message, Util} from "discord.js";
import CommandContext from "../commands/command-context";
import ResponseHelper from "../core/response-helper";
import {expect, assert} from "chai";
import Bot, {EBotEvents} from "../core/bot";
import Language, {ILanguageSource} from "../language/language";
import SwitchParser from "../commands/switch-parser";
import path from "path";
import LogSerializer, {ILogMsg} from "../serializers/log-serializer";
import {InternalArgResolvers, InternalArgTypes} from "../core/constants";
import {IStoreAction, TestStoreActionType, IStateCapsule, ITestState, Reducer, Delta} from "../state/store";
import BotMessages from "../core/messages";
import Utils, {IBinarySearchResult} from "../core/utils";
import Rgba from "../misc/rgba";
import Rgb from "../misc/rgb";
import List from "../collections/collection";
import Log, {LogLevel} from "../core/log";
import Task from "../tasks/task";

// Test globals
const globalAny: any = global;
const describe: any = globalAny.describe;
const it: any = globalAny.it;

// --------- STATIC TESTS

const subjects = {
    ids: [
        "<@285578743324606482>",
        "<#432269407654248459>",
        "<&457741550970077195>",
        "285578743324606482"
    ],

    // Note: This is a regenerated token just for pattern matching!
    token: "NDMzMzg0MzM1MjExNjI2NDk4.DqrIbQ.cC0MAvHKTwbOVrPEa-Xddz356vc",

    rgb: new Rgb(5, 10, 15),

    rgba: new Rgba({
        red: 5,
        green: 10,
        blue: 15,
        alpha: 1
    }),

    collection: new List<any>(["hello", "it's me", {
        name: "John Doe"
    }]),

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

describe("Utils", () => {
    describe("isEmpty()", () => {
        it("should return whether the input is empty", () => {
            expect(Utils.isEmpty("")).to.equal(true);
            expect(Utils.isEmpty(undefined)).to.equal(true);
            expect(Utils.isEmpty("     ")).to.equal(true);
            expect(Utils.isEmpty("   hello world   ")).to.equal(false);
            expect(Utils.isEmpty(null)).to.equal(true);
            expect(Utils.isEmpty(0)).to.equal(false);
            expect(Utils.isEmpty(false)).to.equal(false);
            expect(Utils.isEmpty([])).to.equal(true);
            expect(Utils.isEmpty(["hello"])).to.equal(false);
        });
    });

    describe("hasMentionPrefix()", () => {
        it("should return whether the text provided start with a mention", () => {
            expect(Utils.hasMentionPrefix(`<@${subjects.ids[0]}> hello world`, subjects.ids[0])).to.equal(true);
            expect(Utils.hasMentionPrefix(`hello world <@${subjects.ids[0]}>`, subjects.ids[0])).to.equal(false);
        });

        it("should throw an error when provided invalid input", () => {
            assert.throws(() => Utils.hasMentionPrefix(undefined as any, undefined as any));
            assert.throws(() => Utils.hasMentionPrefix(null as any, null as any));
            assert.throws(() => Utils.hasMentionPrefix(4 as any, 543 as any));
            assert.throws(() => Utils.hasMentionPrefix({} as any, "hello world"));
        });
    });

    describe("escapeText()", () => {
        it("should escape tokens", () => {
            expect(Utils.escapeText(subjects.token, subjects.token)).to.equal("[Token]");
            expect(Utils.escapeText("hi world, hello world, john doe", "hello world")).to.equal("hi world, [Token], john doe");
            expect(Utils.escapeText(`hi world, ${subjects.token}, john doe`, "hello world")).to.equal("hi world, [Token], john doe");
            expect(Utils.escapeText(`hi world, ${subjects.token}, john doe, hello world, hi`, "hello world")).to.equal("hi world, [Token], john doe, [Token], hi");
        });

        it("should escape IPv4s", () => {
            expect(Utils.escapeText("192.168.0.1", "empty")).to.equal("[IPv4]");
            expect(Utils.escapeText("53.32.53.252", "empty")).to.equal("[IPv4]");
            expect(Utils.escapeText("hello 192.168.0.1 world", "empty")).to.equal("hello [IPv4] world");
        });

        it("should escape mentions", () => {
            expect(Utils.escapeText("@everyone hello world", "empty")).to.equal("[Mention] hello world");
            expect(Utils.escapeText("hello @everyone world", "empty")).to.equal("hello [Mention] world");
            expect(Utils.escapeText("@here hello world", "empty")).to.equal("[Mention] hello world");
            expect(Utils.escapeText("hello @here world", "empty")).to.equal("hello [Mention] world");
            expect(Utils.escapeText("hello @here world @everyone john", "empty")).to.equal("hello [Mention] world [Mention] john");
            expect(Utils.escapeText("@herehello @here world@everyonejohn", "empty")).to.equal("[Mention]hello [Mention] world[Mention]john");
            expect(Utils.escapeText(`hello ${subjects.ids[0]} world`, "empty")).to.equal("hello [Mention] world");
            expect(Utils.escapeText(`hello ${subjects.ids[1]} world`, "empty")).to.equal("hello [Mention] world");
            expect(Utils.escapeText(`hello ${subjects.ids[2]} world`, "empty")).to.equal("hello [Mention] world");
            expect(Utils.escapeText(`hello ${subjects.ids[3]} world`, "empty")).to.equal(`hello ${subjects.ids[3]} world`);
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

    describe("resolveId()", () => {
        it("should return the resolved ids", () => {
            // TODO: Review?
            for (let i = 0; i < subjects.ids.length; i++) {
                const result: any = Utils.resolveId(subjects.ids[i]);

                expect(result).to.be.an("string");
                expect(result).to.have.lengthOf(18);
            }
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.resolveId(undefined as any));
            assert.throws(() => Utils.resolveId(1 as any));
            assert.throws(() => Utils.resolveId(0 as any));
            assert.throws(() => Utils.resolveId(false as any));
            assert.throws(() => Utils.resolveId(true as any));
            assert.throws(() => Utils.resolveId({} as any));
            assert.throws(() => Utils.resolveId([] as any));
        });
    });

    describe("timeAgo()", () => {
        it("should return a string", () => {
            expect(Utils.timeAgo(Date.now())).to.be.an("string");
        });
    });

    describe("getRandomInt()", () => {
        it("should return a random number", () => {
            const result: number | null = Utils.getRandomInt(0, 2);

            expect(result).to.be.an("number");
            expect([0, 1]).to.include(result as number);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.getRandomInt(0, 0));
            assert.throws(() => Utils.getRandomInt(0, -1));
            assert.throws(() => Utils.getRandomInt(50, 10));
            assert.throws(() => Utils.getRandomInt("hello" as any, 3));
            assert.throws(() => Utils.getRandomInt("" as any, 3));
            assert.throws(() => Utils.getRandomInt(3, "hello" as any));
            assert.throws(() => Utils.getRandomInt(3, "" as any));
            assert.throws(() => Utils.getRandomInt(undefined as any, 3));
            assert.throws(() => Utils.getRandomInt(3 as any, undefined as any));
            assert.throws(() => Utils.getRandomInt(null as any, 3));
            assert.throws(() => Utils.getRandomInt(3, null as any));
            assert.throws(() => Utils.getRandomInt({} as any, 3));
            assert.throws(() => Utils.getRandomInt(3, {} as any));
        });
    });

    describe("translateState()", () => {
        it("should return the translated state", () => {
            const subjects: any[] = [
                true,
                1,
                "y",
                "yes",
                "on"
            ];

            for (let i: number = 0; i < subjects.length; i++) {
                expect(Utils.translateState(subjects[i].toString())).to.be.an("boolean").and.to.equal(true);
            }
        });
    });

    describe("timeFromNow()", () => {
        it("should return the time from now in milliseconds", () => {
            const result = Utils.timeFromNow(0, 0, 50);

            expect(result).to.be.an("number");
            expect(result.toString()).to.have.lengthOf(13);
        });
    });

    describe("shuffle()", () => {
        it("should shuffle an array", () => {
            expect(Utils.shuffle(["hello", "my", "name", "is", "john doe"])).to.be.an("array").and.to.have.length(5);
            expect(Utils.shuffle([])).to.be.an("array").and.to.have.length(0);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.shuffle(undefined as any))
            assert.throws(() => Utils.shuffle(null as any));
            assert.throws(() => Utils.shuffle("" as any));
            assert.throws(() => Utils.shuffle("hello world" as any));
            assert.throws(() => Utils.shuffle(1 as any));
            assert.throws(() => Utils.shuffle(0 as any));
            assert.throws(() => Utils.shuffle({} as any));
            assert.throws(() => Utils.shuffle(false as any));
            assert.throws(() => Utils.shuffle(true as any));
        });
    });

    describe("getUserIdentifier()", () => {
        it("should return a valid user identifier", () => {
            const result1: string = Utils.getUserIdentifier({
                id: subjects.ids[3],
                tag: "JohnDoe#1234"
            } as any);

            expect(result1).to.equal(`<@${subjects.ids[3]}> (JohnDoe#1234:${subjects.ids[3]})`);
        });

        it("should throw when provided invalid input", () => {
            assert.throws(() => Utils.getUserIdentifier("" as any));
            assert.throws(() => Utils.getUserIdentifier("hello world" as any));
            assert.throws(() => Utils.getUserIdentifier(123 as any));
            assert.throws(() => Utils.getUserIdentifier({} as any));
        });
    });

    const populated: number[] = Utils.populate(50);

    describe("populate()", () => {
        it("should populate an array", () => {
            expect(populated).to.be.an("array").and.to.have.length(50);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.populate(undefined as any));
            assert.throws(() => Utils.populate(null as any));
            assert.throws(() => Utils.populate([] as any));
            assert.throws(() => Utils.populate({} as any));
            assert.throws(() => Utils.populate(false as any));
            assert.throws(() => Utils.populate(true as any));
            assert.throws(() => Utils.populate("test" as any));
            assert.throws(() => Utils.populate("" as any));
        });
    });

    describe("binarySearch()", () => {
        it("should find an existing item", () => {
            const result: IBinarySearchResult = Utils.binarySearch(3, populated);

            expect(result).to.be.an("object");
            expect(result.found).to.be.a("boolean").and.to.equal(true);
            expect(result.iterations).to.be.a("number").and.to.equal(6);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.binarySearch(undefined as any, []));
            assert.throws(() => Utils.binarySearch(false as any, []));
            assert.throws(() => Utils.binarySearch(true as any, []));
            assert.throws(() => Utils.binarySearch([] as any, []));
            assert.throws(() => Utils.binarySearch({} as any, []));
            assert.throws(() => Utils.binarySearch(null as any, []));
            assert.throws(() => Utils.binarySearch("test" as any, []));
            assert.throws(() => Utils.binarySearch("" as any, []));
        });
    });

    describe("binaryInsert()", () => {
        it("should determine an index to insert", () => {
            populated.splice(5, 1);

            const index: number = Utils.binaryInsert(5, populated);

            expect(index).to.be.a("number").and.to.equal(4);

            populated.splice(index + 1, 0, 5);
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.binaryInsert(undefined as any, []));
            assert.throws(() => Utils.binaryInsert(null as any, []));
            assert.throws(() => Utils.binaryInsert(false as any, []));
            assert.throws(() => Utils.binaryInsert(true as any, []));
            assert.throws(() => Utils.binaryInsert("hello" as any, []));
            assert.throws(() => Utils.binaryInsert("" as any, []));
            assert.throws(() => Utils.binaryInsert({} as any, []));
            assert.throws(() => Utils.binaryInsert([] as any, []));

            assert.throws(() => Utils.binaryInsert(undefined as any, null as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, undefined as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, false as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, true as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, "hello" as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, "" as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, {} as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, [] as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, 1 as any));
            assert.throws(() => Utils.binaryInsert(undefined as any, 0 as any));

            assert.throws(() => Utils.binaryInsert(1, 1 as any));
            assert.throws(() => Utils.binaryInsert(1, 0 as any));
            assert.throws(() => Utils.binaryInsert(1, {} as any));
            assert.throws(() => Utils.binaryInsert(1, null as any));
            assert.throws(() => Utils.binaryInsert(1, undefined as any));
            assert.throws(() => Utils.binaryInsert(1, "hello" as any));
            assert.throws(() => Utils.binaryInsert(1, "" as any));
            assert.throws(() => Utils.binaryInsert(1, true as any));
            assert.throws(() => Utils.binaryInsert(1, false as any));
        });
    });

    describe("spreadTime()", () => {
        it("should return spread time", () => {
            expect(Utils.spreadTime(1_000)).to.be.a("string").and.to.equal("1 000");
            expect(Utils.spreadTime(10_000)).to.be.a("string").and.to.equal("10 000");
            expect(Utils.spreadTime(531_352)).to.be.a("string").and.to.equal("531 352");
            expect(Utils.spreadTime(1)).to.be.a("string").and.to.equal("1");
            expect(Utils.spreadTime(10)).to.be.a("string").and.to.equal("10");
            // expect(Utils.spreadTime(-15_050_050)).to.be.a("string").and.to.equal("-15 050 050"); // TODO: Not working
            expect(Utils.spreadTime(-+-15)).to.be.a("string").and.to.equal("15");
        });

        it("should use delimiters", () => {
            expect(Utils.spreadTime(1_000, ",")).to.be.a("string").and.to.equal("1,000");
            expect(Utils.spreadTime(1, ",")).to.be.a("string").and.to.equal("1");
            expect(Utils.spreadTime(100_000, ",")).to.be.a("string").and.to.equal("100,000");
            expect(Utils.spreadTime(-1_000, ",")).to.be.a("string").and.to.equal("-1,000");
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => Utils.spreadTime("hello" as any));
            assert.throws(() => Utils.spreadTime("" as any));
            assert.throws(() => Utils.spreadTime(undefined as any));
            assert.throws(() => Utils.spreadTime(null as any));
            assert.throws(() => Utils.spreadTime([] as any));
            assert.throws(() => Utils.spreadTime({} as any));
            assert.throws(() => Utils.spreadTime(false as any));
            assert.throws(() => Utils.spreadTime(true as any));
        });
    });
});

describe("Rgb", () => {
    describe("toString()", () => {
        it("should return the Rgb in string format", () => {
            expect(subjects.rgb.toString()).to.be.an("string").and.to.equal("5, 10, 15");
        });
    });
});

describe("Rgba", () => {
    describe("toString()", () => {
        it("should return the Rgba in string format", () => {
            expect(subjects.rgba.toString()).to.be.an("string").and.to.equal("5, 10, 15, 1");
        });
    });
});

describe("Collection", () => {
    describe("at()", () => {
        it("should return the item located in the specified index", () => {
            expect(subjects.collection.at(0)).to.be.an("string").and.to.equal("hello");
            expect(subjects.collection.at(1)).to.be.an("string").and.to.equal("it's me");
        });
    });

    describe("removeAt()", () => {
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

    describe("add()", () => {
        it("should add an item to the collection", () => {
            subjects.collection.add("john doe");
            expect(subjects.collection.at(0)).to.be.an("string").and.to.equal("it's me");
            expect(subjects.collection.at(1)).to.be.an("object");
        });
    });

    describe("addUnique()", () => {
        it("should add an unique item", () => {
            expect(subjects.collection.addUnique("doe")).to.be.an("boolean").and.to.equal(true);
            expect(subjects.collection.addUnique("doe")).to.be.an("boolean").and.to.equal(false);
        });
    });

    describe("contains()", () => {
        it("should determine whether the collection contains an item", () => {
            expect(subjects.collection.contains("john doe")).to.be.an("boolean").and.to.equal(true);
            expect(subjects.collection.contains("nope")).to.be.an("boolean").and.to.equal(false);
        });
    });

    describe("find()", () => {
        it("should find an item by its property", () => {
            const result: any = subjects.collection.find("name", "John Doe") as any;

            expect(result).to.be.an("object");
            expect(result.name).to.be.an("string").and.to.equal("John Doe");
        });
    });

    describe("fromFile()", () => {
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
                expect(result.general.token).to.be.an("string").and.to.equal("my_secret_token");
                expect(result.paths.commands).to.be.an("string").and.to.equal("./my_commands");
                expect(result.paths.plugins).to.be.an("string").and.to.equal("./my_plugins");
                expect(result.keys.dbl).to.be.an("string").and.to.equal("my_dbl_key");
                expect(result.keys.bfd).to.be.an("string").and.to.equal("my_bfd_key");
            });

            return settingsSecondPromise.then((result: Settings) => {
                expect(result.general.prefixes).to.be.an("array");
                expect(result.general.prefixes[0]).to.equal(".");
                expect(result.general.token).to.be.an("string").and.to.equal("another_secret_token");
                expect(result.paths.commands).to.be.an("string").and.to.equal("./commandStore");
                expect(result.paths.plugins).to.be.an("string").and.to.equal("./plugins");
            });
        });
    });
});

describe("Switch Parser", () => {
    describe("getSwitches()", () => {
        const result1 = SwitchParser.getSwitches(subjects.switches.short);
        const result2 = SwitchParser.getSwitches(subjects.switches.long);
        const result3 = SwitchParser.getSwitches(subjects.switches.longValue);
        const result4 = SwitchParser.getSwitches(subjects.switches.longQuotedValue);
        const result5 = SwitchParser.getSwitches(subjects.switches.multiple);
        const result6 = SwitchParser.getSwitches(subjects.switches.multipleValues);
        const result7 = SwitchParser.getSwitches(subjects.switches.multipleQuotedValues);

        it("parse command switches into objects", () => {
            for (let i = 0; i < result1.length; i++) {
                expect(result1[0]).to.be.an("object");
            }
        });

        // Short
        it("should parse short switches", () => {
            expect(result1[0].key).to.equal("h");
            expect(result1[0].short).to.equal(true);
            expect(result1[0].value).to.equal(null);
        });

        // Long
        it("should parse long switches", () => {
            expect(result2[0].key).to.equal("help");
            expect(result2[0].short).to.equal(false);
            expect(result2[0].value).to.equal(null);
        });

        // Long Value
        it("should parse long switch's values", () => {
            expect(result3[0].key).to.equal("help");
            expect(result3[0].short).to.equal(false);
            expect(result3[0].value).to.equal("hello");
        });

        // Long Quoted Value
        it("should parse long switch's quoted values", () => {
            expect(result4[0].key).to.equal("help");
            expect(result4[0].short).to.equal(false);
            expect(result4[0].value).to.equal("hello world");
        });

        // Multiple Switches Short
        it("should parse multiple short switches", () => {
            // Multiple -> -h
            expect(result5[0].key).to.equal("h");
            expect(result5[0].short).to.equal(true);
            expect(result5[0].value).to.equal(null);

            // Multiple -> -q
            expect(result5[1].key).to.equal("q");
            expect(result5[1].short).to.equal(true);
            expect(result5[1].value).to.equal(null);
        });

        // Multiple Switches Long
        it("should parse multiple long switches", () => {
            // Multiple -> --hello
            expect(result5[2].key).to.equal("hello");
            expect(result5[2].short).to.equal(false);
            expect(result5[2].value).to.equal(null);

            // Multiple -> --world
            expect(result5[3].key).to.equal("world");
            expect(result5[3].short).to.equal(false);
            expect(result5[3].value).to.equal(null);
        });

        // Multiple Values Short
        it("should parse multiple short switches' values", () => {
            // Multiple Values -> -h
            expect(result6[0].key).to.equal("h");
            expect(result6[0].short).to.equal(true);
            expect(result6[0].value).to.equal(null);

            // Multiple Values -> -q
            expect(result6[1].key).to.equal("q");
            expect(result6[1].short).to.equal(true);
            expect(result6[1].value).to.equal(null);
        });

        // Multiple Values Long
        it("should parse multiple long switches' values", () => {
            // Multiple Values -> --hello
            expect(result6[2].key).to.equal("hello");
            expect(result6[2].short).to.equal(false);
            expect(result6[2].value).to.equal("world");

            // Multiple Values -> --world
            expect(result6[3].key).to.equal("world");
            expect(result6[3].short).to.equal(false);
            expect(result6[3].value).to.equal("hello");
        });

        // Multiple Quoted Values Short
        it("should parse multiple short switches' quoted values", () => {
            // Multiple Quoted Values -> -h
            expect(result7[0].key).to.equal("h");
            expect(result7[0].short).to.equal(true);
            expect(result7[0].value).to.equal(null);

            // Multiple Quoted Values -> -q
            expect(result7[1].key).to.equal("q");
            expect(result7[1].short).to.equal(true);
            expect(result7[1].value).to.equal(null);
        });

        // Multiple Quoted Values Long
        it("should parse multiple long switches' quoted values", () => {
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
});

describe("Delta", () => {
    describe("compare()", () => {
        it("should compare two objects", () => {
            const obj1: object = {
                first: "hello",
                second: "world"
            };

            const obj2: object = {
                third: "john",
                first: "world",
                second: "world"
            };

            expect(Delta.compare(obj1, obj2)).to.be.an("array").and.to.contain("first").and.to.contain("third");
        });
    });
});

// TODO: Disabled for future fix
/* describe("Pagination.next()", () => {
    it("should return the valid next page", () => {
        const pagination: PaginatedMessage = new PaginatedMessage("hello world", 1);

        expect(pagination.getPage()).to.equal("h");
        expect(pagination.next().getPage()).to.equal("e");
        expect(pagination.next().getPage()).to.equal("l");
        expect(pagination.next(-1).getPage()).to.equal("e");
        expect(pagination.next(2).getPage()).to.equal("l");
        expect(pagination.currentPage).to.equal(4);
    });
});

describe("Pagination.previous()", () => {
    it("should return the valid previous page", () => {
        const pagination: PaginatedMessage = new PaginatedMessage("hello world", 1);

        expect(pagination.next(3).previous(2).getPage()).to.equal("e");
        expect(pagination.next(3).previous(1).getPage()).to.equal("l");
        expect(pagination.previous(2).getPage()).to.equal("e");
        expect(pagination.previous(-1).getPage()).to.equal("l");
        expect(pagination.currentPage).to.equal(3);
    });
}); */

describe("Log Serializer", () => {
    describe("serialize()", () => {
        const serializer: LogSerializer = new LogSerializer();

        it("should serialize log messages", () => {
            expect(serializer.serialize({
                message: "Hello world",

                source: {
                    main: "World",
                    extra: "doe"
                },

                time: "Today"
            })).to.be.a("string").and.to.equal("{Today} [World.doe] Hello world");

            expect(serializer.serialize({
                message: "{[Hello world]}",

                source: {
                    main: "It's a",
                    extra: "[Doe's world]"
                },

                time: "{Tomorrow}"
            })).to.be.a("string").and.to.equal("{{Tomorrow}} [It's a.[Doe's world]] {[Hello world]}");
        });

        it("should not serialize when provided invalid arguments", () => {
            expect(serializer.serialize(null as any)).to.be.a("null");
            expect(serializer.serialize(undefined as any)).to.be.a("null");
            expect(serializer.serialize("" as any)).to.be.a("null");
            expect(serializer.serialize("hello world" as any)).to.be.a("null");
            expect(serializer.serialize(3 as any)).to.be.a("null");
        });
    });

    describe("deserialize()", () => {
        const serializer: LogSerializer = new LogSerializer();

        it("should deserialize serialized log messages", () => {
            const result: ILogMsg = serializer.deserialize("{Today} [Some.where] Hello world") as ILogMsg;

            expect(result).to.be.an("object");
            expect(result.message).to.be.a("string").and.to.equal("Hello world");
            expect(result.source).to.be.an("object");
            expect(result.source.main).to.be.an("string").and.to.equal("Some");
            expect(result.source.extra).to.be.an("string").and.to.equal("where");
            expect(result.time).to.be.a("string").and.to.equal("Today");
        });

        it("should deserialize serialized log messages with one source", () => {
            const result: ILogMsg = serializer.deserialize("{Today} [Some] Hello world") as ILogMsg;

            expect(result).to.be.an("object");
            expect(result.message).to.be.a("string").and.to.equal("Hello world");
            expect(result.source).to.be.an("object");
            expect(result.source.main).to.be.an("string").and.to.equal("Some");
            expect(result.source.extra).to.be.a("undefined");
            expect(result.time).to.be.a("string").and.to.equal("Today");
        });
    });
});

// --------- BOT TESTS

const token: string = process.env.TEST_BOT_TOKEN as string;
const testGuildId: Snowflake = process.env.TEST_GUILD_ID as Snowflake;
const testGuildChannelId: Snowflake = process.env.TEST_CHANNEL_ID as Snowflake;

// TODO: The Tempo Engine's interval isn't getting cleared at bot.dispose() (on shutdown) therefore leaving tests hanging. Hotfixed by disabling tempo engine in tests.

if (!token) {
    throw new Error(BotMessages.TEST_EXPECT_TOKEN);
}
else if (!testGuildId) {
    throw new Error(BotMessages.TEST_EXPECT_GUILD);
}
else if (!testGuildChannelId) {
    throw new Error(BotMessages.TEST_EXPECT_CHANNEL);
}

Log.level = LogLevel.None;

export default class TestBot extends Bot<ITestState, TestStoreActionType> {
    public static testGuild: Guild;
    public static testChannel: TextChannel;

    public async deleteLastMessage(): Promise<void> {
        if (!this.client.user) {
            return;
        }

        const lastMessage: Message = this.getLastMessage();

        if (!lastMessage) {
            return;
        }
        else if (lastMessage.deletable) {
            await lastMessage.delete();
        }
    }

    public getLastMessage(): Message {
        return this.client.user.lastMessage;
    }

    public getContext(): CommandContext {
        return new CommandContext({
            bot: this,
            label: "?",

            // TODO: Should we check for a message?
            msg: this.getLastMessage() as Message
        });
    }

    public getResponseHelper(): ResponseHelper {
        return new ResponseHelper(TestBot.testChannel, this, this.client.user);
    }

    // Tests
    public async $sendEmbedMessageOk(): Promise<Message> {
        await this.getResponseHelper().ok("hello world");

        return this.getLastMessage();
    }

    public async $sendEmbedMessageFail(): Promise<Message> {
        await this.getResponseHelper().fail("failed message");

        return this.getLastMessage();
    }

    public async $sendEmbedMessageSend(): Promise<Message> {
        await this.getResponseHelper().send("hello world");

        return this.getLastMessage();
    }

    public async $longMessages(msg: string): Promise<Message> {
        await this.getResponseHelper().ok(msg);

        return this.getLastMessage();
    }
}

let testBot: TestBot = new TestBot({
    settings: new Settings({
        general: {
            token: token,
            prefixes: ["!"]
        }
    })
}, true);

async function init(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        testBot.once(EBotEvents.Ready, () => {
            resolve();
        });

        await testBot.connect();

        // Retrieve test guild and channel
        if (!testBot.client.guilds.has(testGuildId)) {
            throw new Error(BotMessages.TEST_NO_GUILD);
        }

        const testGuild: Guild = testBot.client.guilds.get(testGuildId) as Guild;

        if (!testGuild.channels.has(testGuildChannelId)) {
            throw new Error(BotMessages.TEST_CHANNEL_NO_EXIST);
        }

        const testChannel: TextChannel = testGuild.channels.get(testGuildChannelId) as TextChannel;

        if (testChannel.type !== "text") {
            throw new Error(BotMessages.TEST_CHANNEL_NOT_TEXT);
        }

        // Set channels
        TestBot.testGuild = testGuild;
        TestBot.testChannel = testChannel;
    });
}

// Utility methods
function randomString(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function randomStringX(length: number): string {
    if (length < 1) {
        throw new Error("[randomStringX] Expecting length to be a number higher than 0");
    }

    let finalString: string = "";

    for (let i: number = 0; i < length; i++) {
        finalString += randomString();
    }

    return finalString;
}

beforeEach(async () => {
    await testBot.deleteLastMessage();
});

// Tests
describe("Bot", () => {
    it("should init and login", async () => {
        await init();

        expect(testBot.client.user).to.be.an("object");
    });

    // TODO:
    /* it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
        expect(result.client.user).to.be.a("null");
    });

    it("should init and login using only token", async () => {
        testBot = new TestBot(token, true);

        await init();

        // Tests
        expect(testBot.client.user).to.be.an("object");
    }); */

    it("should not be suspended", () => {
        expect(testBot.suspended).to.be.a("boolean").and.to.equal(false);
    });

    it("should have no owner", () => {
        expect(testBot.owner).to.be.a("undefined");
    });

    it("should have no user groups", () => {
        expect(testBot.userGroups).to.be.an("array");
        expect(testBot.userGroups.length).to.be.a("number").and.to.equal(0);
    });

    it("should have default argument types", () => {
        expect(testBot.argumentTypes).to.be.an("array").and.to.equal(InternalArgTypes);
    });

    it("should have default argument resolvers", () => {
        expect(testBot.argumentResolvers).to.be.an("array").and.to.equal(InternalArgResolvers);
    });

    it("should not handle invalid messages", async () => {
        expect(await testBot.handleMessage(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage("" as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage("hello" as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.handleMessage([] as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should have correct internal commands", () => {
        expect(testBot.internalCommands).to.be.an("array");
        expect(testBot.internalCommands.length).to.be.a("number").and.to.equal(3);
        expect(testBot.internalCommands[0]).to.be.a("string").and.to.equal("help");
        expect(testBot.internalCommands[1]).to.be.a("string").and.to.equal("usage");
        expect(testBot.internalCommands[2]).to.be.a("string").and.to.equal("ping");
    });

    describe("timeouts", () => {
        it("should have no timeouts set", () => {
            expect(testBot.timeouts.length).to.be.a("number").and.to.equal(0);
        });

        it("should set a timeout", () => {
            return new Promise((resolve) => {
                testBot.setTimeout(() => {
                    // Tests
                    expect(testBot.timeouts.length).to.be.a("number").and.to.equal(1);

                    resolve();
                }, 100);
            });
        });

        it("should clear timeouts after executing", () => {
            expect(testBot.timeouts.length).to.be.a("number").and.to.equal(0);
        });
    });

    describe("intervals", () => {
        it("should have no intervals set", () => {
            expect(testBot.intervals.length).to.be.a("number").and.to.equal(0);
        });

        // TODO: More tests
    });
});

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

describe("Services", () => {
    it("should register services", () => {
        expect(testBot.services.contains("test")).to.be.a("boolean").and.to.equal(true);
        expect(testBot.services.contains("fake")).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.getAll().size).to.be.a("number").and.to.equal(3);
    });

    it("should not register invalid services", () => {
        expect(testBot.services.register([] as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(["hello"] as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register("" as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register("hello" as any)).to.be.a("boolean").and.to.equal(false);
        expect(testBot.services.register(3 as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should not enable invalid services", async () => {
        expect(await testBot.services.start("fake")).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start("")).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(3 as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start({} as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(undefined as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(null as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start([] as any)).to.be.a("boolean").and.to.equal(false);
        expect(await testBot.services.start(["hello"] as any)).to.be.a("boolean").and.to.equal(false);
    });

    it("should be able to retrieve services", () => {
        expect(testBot.services.getService("test")).to.be.an("object");
    });

    it("should not be able to retrieve invalid services", () => {
        expect(testBot.services.getService("fake")).to.be.a("null");
        expect(testBot.services.getService("")).to.be.a("null");
        expect(testBot.services.getService({} as any)).to.be.a("null");
        expect(testBot.services.getService([] as any)).to.be.a("null");
        expect(testBot.services.getService(undefined as any)).to.be.a("null");
        expect(testBot.services.getService(null as any)).to.be.a("null");
        expect(testBot.services.getService(["hello"] as any)).to.be.a("null");
        expect(testBot.services.getService(3 as any)).to.be.a("null");
    });
});

describe("Tasks", () => {
    it("should register tasks", () => {
        const actualTasks: string[] = ["do-some-math"];
        const fakeTasks: string[] = ["doe", "john"]

        // Actual tasks
        for (let i: number = 0; i < actualTasks.length; i++) {
            const check: boolean = testBot.tasks.contains(actualTasks[i]);

            expect(check).to.be.a("boolean");
            expect(check).to.equal(true);
        }

        // Fake tasks
        for (let i: number = 0; i < fakeTasks.length; i++) {
            const check: boolean = testBot.tasks.contains(fakeTasks[i]);

            expect(check).to.be.a("boolean");
            expect(check).to.equal(false);
        }

        // Task properties
        const task: Task = testBot.tasks.get("do-some-math") as Task;

        expect(task.meta).to.be.an("object");
        expect(task.meta.name).to.be.a("string");
        expect(task.meta.name).to.equal("do-some-math");
        expect(task.meta.description).to.be.a("string");
        expect(task.meta.description).to.equal("Do some math!");
        expect(task.maxIterations).to.be.a("number");
        expect(task.maxIterations).to.equal(-1);
        expect(task.lastIteration).to.be.a("number");
        expect(task.lastIteration).to.not.equal(-1);
        expect(task.iterations).to.be.a("number");
        expect(task.iterations).to.equal(1);

        // Other tests
        expect(testBot.tasks.contains(undefined as any)).to.be.a("boolean");
        expect(testBot.tasks.contains(undefined as any)).to.equal(false);

        expect(testBot.tasks.contains(null as any)).to.be.a("boolean");
        expect(testBot.tasks.contains(null as any)).to.equal(false);

        expect(testBot.tasks.contains("" as any)).to.be.a("boolean");
        expect(testBot.tasks.contains("" as any)).to.equal(false);
    });

    it("should trigger tasks", () => {
        const triggerResult: boolean = testBot.tasks.trigger("do-some-math");

        expect(triggerResult).to.be.a("boolean");
        expect(triggerResult).to.equal(true);

        // Other tests
        expect(testBot.tasks.trigger("")).to.be.a("boolean");
        expect(testBot.tasks.trigger("")).to.equal(false);

        expect(testBot.tasks.trigger(undefined as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(undefined as any)).to.equal(false);

        expect(testBot.tasks.trigger(null as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(null as any)).to.equal(false);

        expect(testBot.tasks.trigger(1 as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(1 as any)).to.equal(false);

        expect(testBot.tasks.trigger({} as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger({} as any)).to.equal(false);

        expect(testBot.tasks.trigger([] as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger([] as any)).to.equal(false);
    });

    it("should update tasks after triggering", () => {
        const task: Task = testBot.tasks.get("do-some-math") as Task;

        expect(task).to.be.an("object");
        expect(task.lastIteration).to.be.a("number");
        expect(task.lastIteration).to.not.equal(-1);
        expect(task.iterations).to.be.a("number");
        expect(task.iterations).to.equal(2);
    });
});

describe("Languages", () => {
    it("should register languages", () => {
        expect(testBot.language).to.be.an("object");

        const language: Language = testBot.language as Language;
        const languages: ReadonlyMap<string, ILanguageSource> = language.getLanguages();

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

describe("Send Messages", () => {
    it("should send an embed message using ok()", async () => {
        const message: Message = await testBot.$sendEmbedMessageOk();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":white_check_mark: hello world");
    });

    it("should send an embed message using fail()", async () => {
        const message: Message = await testBot.$sendEmbedMessageFail();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(15158332); // Red
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":thinking: failed message");
    });

    it("should send an embed message using send()", async () => {
        const message: Message = await testBot.$sendEmbedMessageSend();

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(0);
    });
});

describe("Long Messages", () => {
    it("should trim long messages", async () => {
        const randomStr: string = randomStringX(50);
        const message: Message = await testBot.$longMessages(randomStr);

        expect(message).to.be.an("object");
        expect(message.embeds).to.be.an("array");
        expect(message.embeds.length).to.be.a("number").and.to.equal(1);
        expect(message.embeds[0]).to.be.an("object");
        expect(message.embeds[0].color).to.be.a("number").and.to.equal(3066993); // Green
        expect(message.embeds[0].description).to.be.a("string").and.to.equal(":white_check_mark: " + randomStr.substring(0, 1024 - 19 - 4) + " ...");
    });
});

describe("Store", () => {
    it("should have undefined initial state", () => {
        expect(testBot.store.getState()).to.be.a("undefined");
    });

    it("should dispatch events", () => {
        return new Promise((resolve) => {
            testBot.store.subscribe((action: IStoreAction): void => {
                expect(action.type).to.equal(TestStoreActionType.$$Test);
                resolve();
            });

            testBot.store.dispatch(TestStoreActionType.$$Test);
        });
    });

    it("state should not be updated without payloads", () => {
        expect(testBot.store.getState()).to.be.a("undefined");
    });

    describe("addReducer()", () => {
        const testReducer: Reducer<ITestState> = (action: IStoreAction, state?: ITestState): ITestState | null => {
            if (action.type === TestStoreActionType.$$Test && action.payload !== undefined && typeof action.payload === "string") {
                return {
                    ...state,
                    $$test: action.payload
                };
            }

            return null;
        };

        it("should add a valid reducer", () => {
            expect(testBot.store.addReducer(testReducer)).to.be.a("boolean").and.to.equal(true);
        });

        it("should not add existing reducers", () => {
            expect(testBot.store.addReducer(testReducer)).to.be.a("boolean").and.to.equal(false);
        });

        it("should throw when passed invalid reducers", () => {
            assert.throws(() => testBot.store.addReducer(null as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer(undefined as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer([] as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer({} as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer("hello" as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer(0 as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer(1 as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer(true as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
            assert.throws(() => testBot.store.addReducer(false as any), BotMessages.STORE_EXPECT_REDUCER_FUNC);
        });
    });

    describe("dispatch()", () => {
        it("should throw on invalid parameters", () => {
            assert.throws(() => testBot.store.dispatch("test" as any));
            assert.throws(() => testBot.store.dispatch(undefined as any));
            assert.throws(() => testBot.store.dispatch(null as any));
            assert.throws(() => testBot.store.dispatch(false as any));
            assert.throws(() => testBot.store.dispatch(true as any));
        });
    });

    describe("subscribe()", () => {
        it("should subscribe handlers", () => {
            return new Promise((resolve, reject) => {
                expect(testBot.store.subscribe((action: IStoreAction) => {
                    if (action.type === TestStoreActionType.$$Test) {
                        resolve();

                        return;
                    }

                    reject();
                })).to.be.a("boolean").and.to.equal(true);

                testBot.store.dispatch(TestStoreActionType.$$Test);
            });
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => testBot.store.subscribe(1 as any));
            assert.throws(() => testBot.store.subscribe(0 as any));
            assert.throws(() => testBot.store.subscribe(false as any));
            assert.throws(() => testBot.store.subscribe(true as any));
            assert.throws(() => testBot.store.subscribe(null as any));
            assert.throws(() => testBot.store.subscribe(undefined as any));
            assert.throws(() => testBot.store.subscribe("hello" as any));
            assert.throws(() => testBot.store.subscribe({} as any));
            assert.throws(() => testBot.store.subscribe([] as any));
        });
    });

    describe("isSubscribed()", () => {
        it("should determine if a handler is subscribed", () => {
            // TODO
        });

        it("should throw on invalid parameters", () => {
            assert.throws(() => testBot.store.isSubscribed(true as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
            assert.throws(() => testBot.store.isSubscribed(false as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
            assert.throws(() => testBot.store.isSubscribed([] as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
            assert.throws(() => testBot.store.isSubscribed({} as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
            assert.throws(() => testBot.store.isSubscribed("hello" as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
            assert.throws(() => testBot.store.isSubscribed(1 as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
            assert.throws(() => testBot.store.isSubscribed(0 as any), BotMessages.STORE_EXPECT_HANDLER_FUNC);
        });
    });
});

describe("Time Machine", () => {
    it("should have no initial state recorded", () => {
        expect(testBot.store.timeMachine.present()).to.be.a("null");
    });

    describe("present()", () => {
        it("should return null when there are no records", () => {
            expect(testBot.store.timeMachine.present()).to.be.a("null");
        });

        it("should return expected state capsule", () => {
            testBot.store.dispatch<string>(TestStoreActionType.$$Test, "hello");

            const capsule: IStateCapsule<ITestState> = testBot.store.timeMachine.present() as IStateCapsule<ITestState>;

            expect(capsule).to.be.an("object");
            expect(capsule.time).to.be.a("number");
            expect(capsule.state).to.be.an("object");
            expect(capsule.state.$$test).to.be.a("string");
            expect(capsule.state.$$test).to.equal("hello");
        });
    });

    describe("before()", () => {
        it("should aggregate capsules before specified time", () => {
            const now: number = Date.now();
            const beforeNow1: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

            expect(beforeNow1).to.be.an("array").and.to.have.length(1);
            expect(beforeNow1[0].time).to.be.a("number").and.to.be.lessThan(now);

            testBot.store.dispatch<string>(TestStoreActionType.$$Test, "world");

            const beforeNow2: IStateCapsule<ITestState>[] = testBot.store.timeMachine.before(now);

            expect(beforeNow2).to.be.an("array").and.to.have.length(1);
            expect(beforeNow2[0]).to.be.an("object");
            expect(beforeNow2[0].state).to.be.an("object");
            expect(beforeNow2[0].state.$$test).to.be.a("string").and.to.equal("hello");
            expect(beforeNow2[0].time).to.be.a("number").and.to.be.lessThan(now);
        });
    });

    describe("after()", () => {
        it("should aggregate capsules after specified time", () => {
            const firstTime: number = (testBot.store.timeMachine.wayback() as IStateCapsule<ITestState>).time;
            const afterNow: IStateCapsule<ITestState>[] = testBot.store.timeMachine.after(firstTime);

            expect(afterNow).to.be.an("array").and.to.have.length(1);
            expect(afterNow[0].state).to.be.an("object");
            expect(afterNow[0].state.$$test).to.be.a("string").and.to.equal("world");
            expect(afterNow[0].time).to.be.a("number").and.to.be.greaterThan(firstTime);
        });
    });
});

describe("Restart", () => {
    it("should restart without throwing", () => {
        return new Promise((resolve) => {
            assert.doesNotThrow(async () => {
                await testBot.restart(false);

                resolve();
            });
        });
    });
});

describe("Disconnect", () => {
    it("should disconnect", async () => {
        const result: Bot = await testBot.disconnect();

        expect(result).to.be.an("object");
        expect(result.client.user).to.be.a("null");
    });
});