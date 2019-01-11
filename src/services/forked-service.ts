import {GenericService, IForkedService, IProcessMsg, ProcessMsgType} from "./generic-service";
import SMIS from "./smis";

/**
 * @extends GenericService
 */
export abstract class ForkedService extends GenericService implements IForkedService {
    public readonly useSMIS: boolean = false;

    protected readonly smis?: SMIS;

    public onMessage(msg: IProcessMsg, sender: any): IProcessMsg[] | IProcessMsg | void {
        //
    }

    protected send(type: ProcessMsgType, data?: any): boolean {
        if (!process.send) {
            return false;
        }

        process.send({
            _t: type,
            _d: data
        });

        return true;
    }
}
