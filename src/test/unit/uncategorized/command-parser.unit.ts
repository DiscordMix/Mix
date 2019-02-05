import {Unit, Test, Assert} from "unit";
import CommandParser from "../../../commands/command-parser";
import {Type} from "../../../commands/type";
import {RawArguments} from "../../../commands/command";

@Unit("Command Parser")
default class {
    @Test("getArguments(): should return valid arguments")
    public getArguments_returnValidArgs() {
        const result: RawArguments = CommandParser.getArguments("[prefix] john_doe apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.equal(result[0], "john_doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with double quote usage")
    public getArguments_parseWithDoubleQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \"sir john doe\" apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with single quote usage")
    public getArguments_parseWithSingleQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \'sir john doe\' apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with multi-quote usage")
    public getArguments_parseWithBackQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \`sir john doe\` apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with multi-quote usage")
    public getArguments_parseWithMultiQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \'sir john doe\' \"delicious apples\" \`more than 100\`", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "delicious apples");
        Assert.equal(result[2], "more than 100");
    }

    // TODO: More tests required.
}
