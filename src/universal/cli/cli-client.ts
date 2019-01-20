import {IUniversalClient, IEventEmitter} from "../universal-client";
import CliEvent from "../../events/cli-event";

export interface ICliClient extends IEventEmitter<CliEvent>, IUniversalClient {
    //
}
