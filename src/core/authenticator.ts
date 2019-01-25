import {Snowflake} from "./bot-extra";
import Log from "./log";
import {PromiseOr} from "@atlas/xlib";

export enum RequestType {
    CommandExecute
}

export interface IRequest {
    readonly entity: string;
    readonly type: RequestType;
}

export interface IAuthenticator {
    authenticate(issuer: Snowflake, request: IRequest): PromiseOr<boolean>;
}

export default class Authenticator implements IAuthenticator {
    public authenticate(issuer: Snowflake, request: IRequest): boolean {
        // TODO: Implement.
        throw Log.notImplemented;
    }
}
