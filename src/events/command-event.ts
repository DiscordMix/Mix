import CommandContext from "../commands/command-context";

export type ICommandEvent = {
    readonly context: CommandContext;
}
