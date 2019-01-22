import {Snowflake} from "discord.js";
import {IDiscordClient} from "./discord-client";
import {IOptimizer} from "../../optimization/optimizer";
import {UserGroup} from "../../commands/command";
import {IActionInterpreter} from "../../actions/action-interpreter";
import {IBot, IBotOptions, InternalCommand} from "../../core/bot-extra";
import {PromiseOr} from "@atlas/xlib";

export interface IDiscordBot<TState = any, TActionType = any> extends IBot<TState, TActionType> {
    readonly owner?: Snowflake;
    readonly client: IDiscordClient;
    readonly actionInterpreter: IActionInterpreter;
    readonly optimizer: IOptimizer;
    readonly prefixCommand: boolean;
    readonly userGroups: UserGroup[];

    postStats(): PromiseOr<void>;
}

export interface IDiscordBotOpts<T = any> extends IBotOptions<T> {
    readonly userGroups?: UserGroup[];
    readonly owner?: Snowflake;
    readonly internalCommands?: InternalCommand[];
    readonly prefixCommand?: boolean;
}
