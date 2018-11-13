import {ICommandEvent} from "./command-event";
import Command from "../commands/command";

/**
 * @extends ICommandEvent
 */
export interface ICommandExecutedEvent extends ICommandEvent {
    readonly command: Command;
}
