require("dotenv").config();

import Bot from "../core/bot";
import {BotEvent} from "../core/botExtra";
import List from "../Collections/List";

export const testSubjects = {
    ids: [
        "<@285578743324606482>",
        "<#432269407654248459>",
        "<&457741550970077195>",
        "285578743324606482"
    ],

    // Note: This is a regenerated token just for pattern matching!
    token: "NDMzMzg0MzM1MjExNjI2NDk4.DqrIbQ.cC0MAvHKTwbOVrPEa-Xddz356vc",

    collection: new List<any>(["hello", "it's me", {
        name: "John Doe"
    }]),

    flags: {
        short: "base arg -h",
        long: "base arg --help",
        longValue: "base --help=hello",
        longQuotedValue: 'base --help="hello world"',
        multiple: "base arg -h -q --hello --world",
        multipleValues: "base arg -h -q --hello=world --world=hello",
        multipleQuotedValues: 'base arg -h -q --hello="world hello" --world="hello world"'
    }
};

/*
    TODO: The Optimizer's interval isn't getting
    cleared at bot.dispose() (on shutdown) therefore leaving tests hanging.
    Hotfixed by disabling optimizer in tests.
*/

export let testBot: Bot = new Bot(null as any, {}, true);

export async function init(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        testBot.once(BotEvent.Ready, () => {
            resolve();
        });

        await testBot.connect();
    });
}
