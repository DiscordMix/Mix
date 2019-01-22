// Setup environment variables
require("dotenv").config();

import {Snowflake} from "discord.js";
import {UserGroup} from "../commands/command";
import StatCounter from "../core/stat-counter";
import ActionInterpreter from "../actions/action-interpreter";
import Optimizer from "../optimization/optimizer";
import {InternalCommand, DiscordBotToken} from "../core/bot-extra";
import BotConnector from "../core/bot-connector";
import DiscordClient from "../universal/discord/discord-client";
import {IDiscordBotOpts, IDiscordBot} from "../universal/discord/discord-bot";
import GenericBot from "./generic-bot";
import {IDiscordSettings} from "../universal/discord/discord-settings";
import DiscordPathResolver from "../core/path-resolver";

export const DefaultDiscordSettings: IDiscordSettings = {
    general: {
        prefix: ["!"],
        token: undefined as any
    },

    paths: {
        commands: "commands",
        languages: "languages",
        services: "services",
        tasks: "tasks"
    }
};

// TODO: Should emit an event when state changes
/**
 * The Discord bot class.
 * @extends GenericBot
 */
export default class DiscordBot<TState = any, TActionType = any> extends GenericBot<TState, TActionType> implements IDiscordBot<TState, TActionType> {
    public readonly prefixCommand: boolean;
    public readonly internalCommands: InternalCommand[];
    public readonly userGroups: UserGroup[];
    public readonly owner?: Snowflake;
    public readonly actionInterpreter: ActionInterpreter;
    public readonly client: DiscordClient;
    public readonly optimizer: Optimizer;
    public readonly paths: DiscordPathResolver;

    protected setupStart: number = 0;

    protected settings: IDiscordSettings;
    protected options: IDiscordBotOpts;

    // TODO: Implement stat counter
    protected readonly statCounter: StatCounter;

    protected readonly connector: BotConnector;

    /**
     * Setup the bot from an object
     * @param {Partial<IDiscordBotOpts> | DiscordBotToken} options
     * @param {boolean} [testMode=false]
     */
    public constructor(options: Partial<IDiscordBotOpts> | DiscordBotToken) {
        super({
            ...DefaultDiscordSettings,
            ...options
        });

        /**
         * Utility to resolve file and directory paths.
         * @type {DiscordPathResolver}
         * @readonly
         */
        this.paths = new DiscordPathResolver(this.settings.paths);
    }
}
