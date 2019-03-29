import {unit, test, Assert, feed, Is, JsType, Does, target} from "unit";
import CommandParser from "../../commands/commandParser";
import {type} from "../../commands/type";
import {RawArguments, InputArgument} from "../../commands/command";
import {defaultArgResolvers} from "../../core/constants";

@unit("Command Parser")
default class {
    @test("should return valid arguments")
    @target(CommandParser.getArguments)
    public getArguments_returnValidArgs() {
        const result: RawArguments = CommandParser.getArguments("[prefix] john_doe apples 100", [
            {
                name: "name",
                type: type.string
            },
            {
                name: "favoriteFood",
                type: type.string
            },
            {
                name: "favoriteNumber",
                type: type.integer
            }
        ]);

        Assert.equal(result[0], "john_doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @test("should parse command strings with double quote usage")
    @target(CommandParser.getArguments)
    public getArguments_parseWithDoubleQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \"sir john doe\" apples 100", [
            {
                name: "name",
                type: type.string
            },
            {
                name: "favoriteFood",
                type: type.string
            },
            {
                name: "favoriteNumber",
                type: type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @test("should parse command strings with single quote usage")
    @target(CommandParser.getArguments)
    public getArguments_parseWithSingleQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \'sir john doe\' apples 100", [
            {
                name: "name",
                type: type.string
            },
            {
                name: "favoriteFood",
                type: type.string
            },
            {
                name: "favoriteNumber",
                type: type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @test("should parse command strings with backquote usage")
    @target(CommandParser.getArguments)
    public getArguments_parseWithBackQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \`sir john doe\` apples 100", [
            {
                name: "name",
                type: type.string
            },
            {
                name: "favoriteFood",
                type: type.string
            },
            {
                name: "favoriteNumber",
                type: type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @test("should parse command strings with multi-quote usage")
    @target(CommandParser.getArguments)
    public getArguments_parseWithMultiQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \'sir john doe\' \"delicious apples\" \`more than 100\`", [
            {
                name: "name",
                type: type.string
            },
            {
                name: "favoriteFood",
                type: type.string
            },
            {
                name: "favoriteNumber",
                type: type.string
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "delicious apples");
        Assert.equal(result[2], "more than 100");
    }

    @test("should parse command strings with empty long flags")
    @target(CommandParser.getArguments)
    public getArguments_longEmptyFlags() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] --verbose --inspect", [
            {
                name: "verbose",
                type: type.boolean
            },
            {
                name: "inspect",
                type: type.boolean
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(2)
        );

        Assert.equal(result[0], "true");
        Assert.equal(result[1], "true");
    }

    @test("should parse command strings' long flags with explicit values")
    @target(CommandParser.getArguments)
    public getArguments_longFlagsExplicitValues() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] --verbose=false --inspect=true --continue=false", [
            {
                name: "verbose",
                type: type.boolean
            },
            {
                name: "inspect",
                type: type.boolean
            },
            {
                name: "continue",
                type: type.boolean
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "false");
        Assert.equal(result[1], "true");
        Assert.equal(result[2], "false");
    }

    @test("should parse command strings with empty short flags")
    @target(CommandParser.getArguments)
    public getArguments_shortEmptyFlags() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] -v -i", [
            {
                name: "verbose",
                type: type.boolean,
                flagShortName: "v"
            },
            {
                name: "inspect",
                type: type.boolean,
                flagShortName: "i"
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(2)
        );

        Assert.equal(result[0], "true");
        Assert.equal(result[1], "true");
    }

    @test("should parse command strings' short flags with explicit values")
    @target(CommandParser.getArguments)
    public getArguments_shortFlagsExplicitValues() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] -v=false -i=true -c=false", [
            {
                name: "verbose",
                type: type.boolean,
                flagShortName: "v"
            },
            {
                name: "inspect",
                type: type.boolean,
                flagShortName: "i"
            },
            {
                name: "continue",
                type: type.boolean,
                flagShortName: "c"
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "false");
        Assert.equal(result[1], "true");
        Assert.equal(result[2], "false");
    }

    @test("should throw when provided invalid arguments")
    @target(CommandParser.getArguments)
    @feed(null, null)
    @feed(undefined, undefined)
    @feed(0, 1)
    @feed(1, 0)
    @feed(true, false)
    @feed(false, true)
    public getArguments_throwOnInvalidParams(comamndString: any, schema: any) {
        Assert.throws(() => CommandParser.getArguments(comamndString, schema));
    }

    @test("should throw when provided invalid arguments")
    @target(CommandParser.resolveArguments)
    @feed(undefined)
    @feed(null)
    @feed([])
    @feed("")
    @feed("test")
    @feed(1)
    @feed(0)
    @feed(false)
    @feed(true)
    public resolveArguments_throwOnInvalidParams(opts: any) {
        // TODO: Publish Unit and use .throwsAsync()
        let resultError: Error | null = null;

        CommandParser.resolveArguments(opts).catch((error: Error) => {
            resultError = error;
        });

        Assert.that(resultError, Is.null);
    }

    @test("should not resolve strings")
    @target(CommandParser.resolveArguments)
    public async resolveArguments_notResolveStrings() {
        const result: any = await CommandParser.resolveArguments({
            arguments: ["john doe", "anonymous"],
            message: null as any,
            resolvers: defaultArgResolvers,

            schema: [
                {
                    name: "name",
                    type: type.string
                },
                {
                    name: "aka",
                    type: type.string
                }
            ]
        });

        Assert.that(result,
            Is.object,
            Does.haveProperty("name"),
            Does.haveProperty("aka")
        );

        Assert.equal(result.name, "john doe");
        Assert.equal(result.aka, "anonymous");
    }

    @test("should resolve integer values")
    @target(CommandParser.resolveArguments)
    public async resolveArguments_resolveIntegers() {
        const result: any = await CommandParser.resolveArguments({
            arguments: ["100", "-13"],
            message: null as any,
            resolvers: defaultArgResolvers,

            schema: [
                {
                    name: "favoriteNumber",
                    type: type.integer
                },
                {
                    name: "leastFavoriteNumber",
                    type: type.integer
                }
            ]
        });

        Assert.that(result,
            Is.object,
            Does.haveProperty("favoriteNumber"),
            Does.haveProperty("leastFavoriteNumber")
        );

        Assert.equal(result.favoriteNumber, 100);
        Assert.equal(result.leastFavoriteNumber, -13);
    }

    @test("should resolve decimal values")
    @target(CommandParser.resolveArguments)
    public async resolveArguments_resolveDecimals() {
        const result: any = await CommandParser.resolveArguments({
            arguments: ["1.1", "1.0", "3.14", "-6.7890"],
            message: null as any,
            resolvers: defaultArgResolvers,

            schema: [
                {
                    name: "first",
                    type: type.decimal
                },
                {
                    name: "second",
                    type: type.decimal
                },
                {
                    name: "third",
                    type: type.decimal
                },
                {
                    name: "forth",
                    type: type.decimal
                }
            ]
        });

        Assert.that(result,
            Is.object,
            Does.haveProperty("first"),
            Does.haveProperty("second"),
            Does.haveProperty("third"),
            Does.haveProperty("forth")
        );

        Assert.equal(result.first, 1.1);
        Assert.equal(result.second, 1.0);
        Assert.equal(result.third, 3.14);
        Assert.equal(result.forth, -6.7890);
    }

    @test("should resolve boolean values")
    @target(CommandParser.resolveArguments)
    public async resolveArguments_resolveBooleans() {
        const result: any = await CommandParser.resolveArguments({
            arguments: ["false", "true", "false", "true"],
            message: null as any,
            resolvers: defaultArgResolvers,

            schema: [
                {
                    name: "cool",
                    type: type.boolean
                },
                {
                    name: "hungry",
                    type: type.boolean
                },
                {
                    name: "full",
                    type: type.boolean
                },
                {
                    name: "funny",
                    type: type.boolean
                }
            ]
        });

        Assert.that(result,
            Is.object,
            Does.haveProperty("cool"),
            Does.haveProperty("hungry"),
            Does.haveProperty("full"),
            Does.haveProperty("funny")
        );

        Assert.equal(result.cool, false);
        Assert.equal(result.hungry, true);
        Assert.equal(result.full, false);
        Assert.equal(result.funny, true);
    }

    // TODO: More tests required.
}
