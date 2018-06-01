import Permission from "../core/permission";
import ChatEnvironment from "../core/chat-environment";

export interface CommandMetaOptions {
    name: string;
    desc: string;
    aliases: Array<string>;
    args: any;
}

export interface CommandRestrictOptions {
    enabled: boolean;
    cooldown: number;
    permissions: Array<any>; // TODO: Permission type
    env: ChatEnvironment;
    auth: number;
}

export interface CommandOptions {
    executed: Function;
    canExecute: Function;
    meta: CommandMetaOptions;
    restrict: CommandRestrictOptions;
}
