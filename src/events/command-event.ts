import DiscordContext from "../commands/command-context";

export interface ICommandEvent {
    readonly context: DiscordContext;
}
