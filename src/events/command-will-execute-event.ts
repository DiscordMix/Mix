import PreventableCommandEvent from "./preventable-command-event";
import Command from "../commands/command";

export interface ICommandWillExecuteEvent extends PreventableCommandEvent {
    readonly command: Command;
}
