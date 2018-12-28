import CommandContext from "../commands/command-context";

export interface ICommandEvent {
    readonly context: CommandContext;
}
