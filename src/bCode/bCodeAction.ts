import {IBCodeContext} from "./bCodeContext";
import BCodeRegistry from "./bCodeRegistry";

/**
 * The callback invoked to resolve a BCode string.
 */
export type BCodeAction = (context: IBCodeContext) => string;

/**
 * Retrieves the bot's username.
 */
export const bBotUsername: BCodeAction = ($) => {
    return $.bot.client.user.username;
};

/**
 * Retrieves the bot's full user tag.
 */
export const bBotTag: BCodeAction = ($) => {
    return $.bot.client.user.tag;
};

/**
 * Returns the bot's ping in milliseconds.
 */
export const bBotPing: BCodeAction = ($) => {
    return $.bot.client.ping.toString() + "ms";
};

/**
 * Retrive the bot's uptime.
 */
export const bBotUptime: BCodeAction = ($) => {
    return $.bot.client.uptime.toString() + "ms";
};

export function registerDefaultBCodes(registry: BCodeRegistry): void {
    registry
        .set("name", bBotUsername)
        .set("tag", bBotTag)
        .set("ping", bBotPing)
        .set("uptime", bBotUptime);
}
