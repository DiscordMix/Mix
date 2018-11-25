import {ISerializer} from "./serializer";

export enum CommonUrlProtocols {
    Http = "http",
    Https = "https",
    File = "file",
    FTP = "ftp",
    IRC = "irc",
    MailTo = "mailto",
    MongoDB = "mongodb",
    SFTP = "sftp",
    WSS = "wss",
    UDP = "udp"
}

export type IUrlDomain = {
    readonly subdomain?: string;
    readonly name: string;
    readonly extension: string;
}

export type IUrl<ParametersType = any> = {
    readonly protocol: CommonUrlProtocols | string;
    readonly domain: IUrlDomain;
    readonly port?: number;
    readonly path?: string;
    readonly queryString?: string;
    readonly parameters?: ParametersType;
    readonly fragment?: string;
}

export default class UrlSerializer<ParametersType = any, UrlType extends IUrl = IUrl<ParametersType>> implements ISerializer<UrlType> {
    public serialize(data: IUrl): string | null {
        let result: string = `${data.protocol}://${data.domain.subdomain ? data.domain.subdomain + "." : ""}${data.domain.name}${data.domain.extension}`;

        if (data.port !== undefined) {
            result += `:${data.port}`;
        }

        if (data.path !== undefined) {
            result += `/${data.path}`;
        }

        if (data.queryString !== undefined) {
            result += `?${data.queryString}`;
        }

        if (data.fragment !== undefined) {
            result += `#${data.fragment}`;
        }

        return result;
    }
    
    public deserialize(serializedData: string): UrlType | null {
        // TODO: Implement
        throw new Error("Method not implemented.");
    }
}