import {IBot} from "../core/botExtra";
import BCodeRegistry from "./bCodeRegistry";

export interface IBCodeContext {
    readonly bot: IBot;
    readonly registry: BCodeRegistry;
}
