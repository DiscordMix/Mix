import {ICommandEvent} from "./command-event";
import Command from "../commands/command";

export interface ICommandExecutedEvent extends ICommandEvent {
    readonly command: Command;
}
