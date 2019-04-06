import {BCodeAction, registerDefaultBCodes} from "./bCodeAction";
import Log from "../core/log";
import {IBCodeContext} from "./bCodeContext";
import {IBot} from "../core/botExtra";

export interface IBCodeRegistry {
    call(name: string): string;
    getAll(): ReadonlyMap<string, BCodeAction>;
    createContext(): IBCodeContext;
    registerDefaults(): this;
    set(name: string, action: BCodeAction): this;
}

export default class BCodeRegistry implements IBCodeRegistry {
    protected readonly codes: Map<string, BCodeAction>;
    protected readonly context: IBCodeContext;
    protected readonly bot: IBot;

    public constructor(bot: IBot) {
        this.codes = new Map();
        this.bot = bot;
        this.context = this.createContext();
    }

    /**
     * Invoke a BCode action.
     */
    public call(name: string): string {
        if (!this.codes.has(name)) {
            throw Log.error("No BCode with such name was previously registered");
        }

        return this.codes.get(name)!(this.context);
    }

    /**
     * Retrieve all stored BCodes.
     */
    public getAll(): ReadonlyMap<string, BCodeAction> {
        return this.codes;
    }

    /**
     * Create a fresh BCode context object.
     */
    public createContext(): IBCodeContext {
        return {
            bot: this.bot,
            registry: this
        };
    }

    /**
     * Register default BCodes onto this
     * registry instance.
     */
    public registerDefaults(): this {
        registerDefaultBCodes(this);

        return this;
    }

    /**
     * Set a BCode.
     */
    public set(name: string, action: BCodeAction): this {
        this.codes.set(name, action);

        return this;
    }
}
