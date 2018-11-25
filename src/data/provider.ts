import {IDbMessage} from "./generic-providers";
import {Snowflake} from "discord.js";

// TODO: Delete as new providers implemented

export type IReadonlyProvider<ValueType, KeyType = string> = {
    get(key: KeyType): ValueType;
}

export interface IProvider<ValueType, KeyType = string> extends IReadonlyProvider<ValueType, KeyType> {
    set(key: KeyType, value: ValueType): void;
}

export interface IUpdatableProvider<ValueType, KeyType = string> extends IProvider<ValueType, KeyType> {
    update(key: KeyType, value: Partial<ValueType>): void;
}

export interface IMessageProvider extends IUpdatableProvider<IDbMessage, Snowflake> {
    get(key: Snowflake): IDbMessage;
    set(key: Snowflake, value: IDbMessage): void;
    update(key: Snowflake, value: IDbMessage): void;
}