// TODO: Finish

import {Snowflake} from "discord.js";
import Utils from "../../core/utils";

export enum DefaultAuthLevel {
    Default = 0,
    Owner = -1,
}

export type IAuthLevel = DefaultAuthLevel | number;

export type IAuthSchemaEntry = {
    readonly name: string;
    readonly auth: IAuthLevel;
}

export type IAuthSchema = IAuthSchemaEntry[];

export default class AuthService {
    private readonly path: string;
    private readonly authMap: Map<IAuthLevel, string>; // Auth Level -> Entry Name

    private authMapUpdated: boolean = false;
    private schema?: IAuthSchema;

    // TODO
    private store: any;

    constructor(path: string) {
        this.path = path;
        this.authMap = new Map<IAuthLevel, string>();
    }

    /**
     * @todo
     * @return {boolean}
     */
    public updateSchemaAuthMap(): boolean {
        if (this.schema) {
            this.authMap.clear();

            for (let i = 0; i < this.schema.length; i++) {
                //this.authMap.set(i, this.schema[i].auth);
            }

            return true;
        }

        return false;
    }

    public async reloadSchema(updateAuthMap: boolean = true): Promise<boolean> {
        const data: IAuthSchema | null = await Utils.readJson<IAuthSchema>(this.path);

        if (data) {
            this.schema = data;

            if (updateAuthMap) {
                // TODO
                //this.updateAuthMap();
                this.authMapUpdated = true;
            }
            else {
                this.authMapUpdated = false;
            }

            return true;
        }

        return false;
    }

    public reloadSchemaSync(updateAuthMap: boolean = true): boolean {
        const data: IAuthSchema | null = Utils.readJsonSync(this.path);

        if (data !== null) {
            this.schema = data;

            if (updateAuthMap) {
                // TODO
                // this.updateAuthMap();
                this.authMapUpdated = true;
            }
            else {
                this.authMapUpdated = false;
            }

            return true;
        }

        return false;
    }

    public getAuth(user: Snowflake, guild: Snowflake): IAuthLevel {
        /* if (this.authMapUpdated && this.authMap.size > 0 && this.authMap.has()) {
            // TODO
        } */

        return DefaultAuthLevel.Default;
    }

    public authorize(user: Snowflake, guild: Snowflake, auth: IAuthLevel): boolean {
        return this.getAuth(user, guild) >= auth;
    }
}
