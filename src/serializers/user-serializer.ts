import {ISerializer} from "./serializer";
import {User, Collection, Snowflake} from "discord.js";
import {Patterns} from "..";

export default class UserSerializer<UserType = User> implements ISerializer<UserType> {
    private readonly source: Collection<Snowflake, UserType>;

    public constructor(source: Collection<Snowflake, UserType>) {
        this.source = source;
    }

    public serialize(data: UserType): string | null {
        return data.toString();
    }
    
    public deserialize(serializedData: string): UserType | null {
        if (!Patterns.mention.test(serializedData)) {
            return null;
        }

        return this.source.get(serializedData) || null;
    }
}