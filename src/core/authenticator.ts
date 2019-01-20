import {DiscordSnowflake} from "./bot-extra";
import Log from "../logging/log";
import {PromiseOr} from "@atlas/xlib";

export enum RequestType {
    CommandExecute
}

export interface IRequest {
    readonly entity: string;
    readonly type: RequestType;
}

export interface IAuthenticator {
    authenticate(issuer: DiscordSnowflake, request: IRequest): PromiseOr<boolean>;
}

export default class Authenticator implements IAuthenticator {
    public authenticate(issuer: DiscordSnowflake, request: IRequest): boolean {
        // TODO: Implement
        throw Log.notImplemented;
    }
}
