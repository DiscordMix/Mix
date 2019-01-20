import {Message} from "discord.js";
import {IUniversalMessage} from "../universal-message";

export class DiscordMessage extends Message implements IUniversalMessage {
    public get time(): number {
        return this.createdTimestamp;
    }
}
