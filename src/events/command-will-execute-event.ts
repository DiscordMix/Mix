import PreventableCommandEvent from "./preventable-command-event";
import CommandContext from "../commands/command-context";
import Command from "../commands/command";

export interface ICommandWillExecuteEvent extends PreventableCommandEvent {
    readonly command: Command;
}
