import Bot from "../core/Bot";
import {IDisposable} from "../core/Helpers";
import {IFragment, IMeta} from "../Fragments/Fragment";
import DiscordEvent from "../core/DiscordEvent";

// TODO: Move both enum and types elsewhere.
export enum ProcessMsgType {
    Heartbeat,
    Stop,
    SmisProtocolHandshake,
    SmisProtocolRefuse,
    SmisProtocolAccept,
    StdOutPipe
}

export interface IProcessMsg<T = any> {
    readonly type: ProcessMsgType;
    readonly data: T;
}

export interface IRawProcessMsg<T = any> {
    readonly _d: T;
    readonly _t: ProcessMsgType;
}

export interface IServiceOptions {
    readonly bot: Bot;
    readonly lib?: any;
}

export interface IGenericService extends IFragment, IDisposable {
    readonly fork: boolean;

    start(): void;
    stop(): void;
    canStart(): boolean;
}

export abstract class GenericService implements IGenericService {
    public abstract meta: IMeta;
    public readonly fork: boolean = false;

    public canStart(): boolean {
        return true;
    }

    public stop(): void {
        //
    }

    public dispose(): void {
        //
    }

    public abstract start(): void;
}

export interface IService extends IGenericService {
    readonly running: boolean;
    readonly listeners: Map<DiscordEvent, any>;
}

export interface IForkedService extends IGenericService {
    readonly useSMIS: boolean;

    onMessage(msg: IProcessMsg, sender: any): IProcessMsg[] | IProcessMsg | void;
}
