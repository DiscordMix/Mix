import {CommandOptions} from "../../../commands/command";
import ChatEnvironment from "../../../core/chat-environment";
import CommandContext from "../../../commands/command-context";
import {GuildMember, Snowflake} from "discord.js";
import DataProvider from "../../../data-providers/data-provider";
import Log from "../../../core/log";
import JsonProvider from "../../../data-providers/json-provider";
import Utils from "../../../core/utils";

export interface StoredWarning {
    readonly reason: string;
    readonly moderator: Snowflake;
    readonly time: number;
}

export default <CommandOptions>{
    meta: {
        name: "warnings",
        desc: "View the warnings of a member",

        args: {
            member: "!:member"
        }
    },

    restrict: {
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: (context: CommandContext): void => {
        const member: GuildMember = context.arguments[0];

        let dataProvider: DataProvider | undefined = context.bot.dataStore;

        if (!dataProvider) {
            Log.error("[Warnings.executed] Expecting data provider");
            context.fail("No data provider");

            return;
        }
        else if (!(dataProvider instanceof JsonProvider)) {
            Log.error("[Warnings.executed] Expecting data provider to be of type 'JsonProvider'");
            context.fail("Invalid data provider type");

            return;
        }

        const warnings: Array<StoredWarning> = dataProvider.get(`warnings.u${member.id}`);

        if (!warnings) {
            context.ok("This user has no warnings.");

            return;
        }

        context.ok(warnings.map((warning: StoredWarning, index: number) => `**${index + 1}**. ${warning.reason} - ${Utils.timeAgo(warning.time)}`).join("\n"));
    }
};
