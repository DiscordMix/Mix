import ChatEnvironment from "../core/chat-environment";
import CommandContext from "./command-context";
import Fragment from "../fragments/fragment";

export type UserGroup = Array<string>;

export enum CommandArgumentStyle {
    Specific,
    Descriptive
}

// TODO: Make use of this
export interface CommandMetaArgument {
    readonly name: string;
    readonly type: string;
    readonly desc?: string;
    readonly defaultValue?: any;
    readonly required?: boolean;
}

export interface CommandRestrict {
    selfPermissions: Array<any>;
    issuerPermissions: Array<any>;
    environment: ChatEnvironment;
    auth: number;
    specific: Array<string>;
    cooldown: number;
}

/**
 * @extends Fragment
 */
export default abstract class Command extends Fragment {
    readonly aliases: Array<string> = [];
    readonly args: any = {};
    readonly newArgs: Array<CommandMetaArgument> = [];
    readonly isEnabled: boolean = true;
    readonly exclude: Array<string> = [];
    readonly singleArg: boolean = false;

    readonly restrict: CommandRestrict = {
        auth: 0,
        cooldown: 0,
        environment: ChatEnvironment.Anywhere,
        issuerPermissions: [],
        selfPermissions: [],
        specific: []
    };

    /**
     * @param {CommandOptions} options
     */
    constructor() {
        super();
    }

    abstract executed(context: CommandContext, api: any): any;

    canExecute(context: CommandContext): boolean {
        return true;
    }

    /**
     * @param {string} query
     * @return {boolean} Whether the query is excluded
     */
    isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    get minArguments(): number {
        const keys = Object.keys(this.args);

        let counter = 0;

        for (let i = 0; i < keys.length; i++) {
            if (this.args[keys[i]].startsWith("!")) {
                counter++;
            }
        }

        return counter;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts
     */
    get maxArguments(): number {
        return Object.keys(this.args).length;
    }
}
