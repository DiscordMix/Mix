import Bot from "../core/bot";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import SMIS from "./smis";
import {DiscordEvent} from "../decorators/decorators";
import {IDisposable} from "../core/helpers";

// TODO: Move both enum and types elsewhere
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
};

export interface IRawProcessMsg<T = any> {
    readonly _d: T;
    readonly _t: ProcessMsgType;
}

export interface IServiceOptions {
    readonly bot: Bot;
    readonly lib?: any;
}

export interface IGenericService extends IFragment, IDisposable {
    start(): void;
    stop(): void;
    canStart(): boolean;

    readonly fork: boolean;
}

export abstract class GenericService implements IGenericService {
    public abstract meta: IFragmentMeta;
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

export default abstract class Service extends GenericService implements IService {
    public readonly listeners: Map<DiscordEvent, any>;

    protected readonly bot: Bot;

    /**
     * @todo Just accept bot and api, no need for Options obj
     * @param {IServiceOptions} options
     */
    protected constructor(options: IServiceOptions) {
        super();

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {Map<DiscordEvent, *>}
         * @readonly
         */
        this.listeners = new Map();
    }

    /**
     * @param {DiscordEvent} event
     * @param {*} handler
     * @return {this}
     */
    protected on(event: DiscordEvent, handler: any): this {
        this.bot.client.on(event, handler);
        this.listeners.set(event, handler);

        return this;
    }

    public dispose(): void {
        for (let [event, handler] of this.listeners) {
            this.bot.client.removeListener(event, handler);
        }
    }

    /**
     * Whether the service is running
     * @return {boolean}
     */
    public get running(): boolean {
        // TODO: This is just template-future-code (does NOT work!)
        // ... Need someway to check if the service is actually running (not just saved + stopped)
        return this.bot.services.contains(this.meta.name);
    }
}

export interface IForkedService extends IGenericService {
    onMessage(msg: IProcessMsg, sender: any): IProcessMsg[] | IProcessMsg | void;

    readonly useSMIS: boolean;
}

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