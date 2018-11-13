import PreventableCommandEvent from "./preventable-command-event";
import Command from "../commands/command";

/**
 * @extends PreventableCommandEvent
 */
export interface ICommandWillExecuteEvent extends PreventableCommandEvent {
    readonly command: Command;
}
