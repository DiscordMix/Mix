import {
    Guild,
    GuildChannel,
    GuildMember,
    Message,
    PermissionResolvable,
    RichEmbed,
    Snowflake,
    TextChannel,
    User
} from "discord.js";

import fs from "fs";
import path from "path";
import Patterns from "./patterns";
import Bot from "./bot";

const TimeAgo: any = require("javascript-time-ago");
const en: any = require("javascript-time-ago/locale/en");

const moderationPermissions: PermissionResolvable[] = [
    "MANAGE_GUILD",
    "ADMINISTRATOR",
    "BAN_MEMBERS",
    "KICK_MEMBERS",
    "MANAGE_CHANNELS",
    "MANAGE_MESSAGES",
    "MANAGE_ROLES_OR_PERMISSIONS"
];

TimeAgo.locale(en);

const timeAgo: any = new TimeAgo("en-US");

export interface ISendOptions {
    readonly avatarUrl: string;
    readonly channel: TextChannel;
    readonly message: string;
    readonly color?: string;
    readonly footer?: string;
    readonly title?: string;
}

export interface IBinarySearchResult {
    readonly iterations: number;
    readonly index: number | null;
    readonly result: number | null;
    readonly found: boolean;
}

export default abstract class Utils {
    public static readonly botLists: Snowflake[] = [
        "374071874222686211", // Bots for Discord (BFD)
        "264445053596991498", // Discord Bot List (DBL)
        "110373943822540800", // Discord Bots
        "387812458661937152", // Botlist.space
        "450100127256936458"  // Discord Bot List (2)
    ];

    /**
     * @param {string} mention
     * @return {string}
     */
    public static resolveId(mention: string): string {
        if (typeof mention !== "string") {
            throw new Error("Expecting mention parameter to be a string");
        }

        return mention
            .replace("<", "")
            .replace(">", "")
            .replace("@", "")
            .replace("!", "")
            .replace("&", "")
            .replace("#", "");
    }

    /**
     * @param {number} time
     * @param {string} [delimiter=" "]
     * @return {string}
     */
    public static spreadTime(time: number, delimiter: string = " "): string {
        if (typeof time !== "number" || typeof delimiter !== "string") {
            throw new Error("Expecting time parameter to be a number and delimiter parameter to be a string");
        }

        const timeStr: string = time.toString();

        let result: string[] = timeStr.split("");
        let counter: number = 0;

        for (let i: number = timeStr.length; i > 0; i--) {
            if (counter >= 3) {
                result.splice(i, 0, delimiter);
                counter = 0;
            }
            else {
                counter++;
            }
        }

        return result.join("");
    }

    // TODO: Needs testing
    public static createTimedAction<ReturnType = any>(bot: Bot, action: () => ReturnType, timeout: number, timeoutResult: ReturnType | any): Promise<ReturnType> {
        return new Promise(async (resolve) => {
            // TODO: Is this required?
            let stopFlag: boolean = false;

            const timer: NodeJS.Timeout = bot.setTimeout(() => {
                stopFlag = true;
                resolve(timeoutResult);
            }, timeout);

            if (!stopFlag) {
                bot.clearTimeout(timer);

                return await action;
            }
        });
    }

    /**
     * @param {number} min The minimum amount
     * @param {number} max The maximum amount
     * @return {number} The random number
     */
    public static getRandomInt(min: number, max: number): number {
        if (typeof min !== "number" || typeof max !== "number" || min > max || min === max) {
            throw new Error("Expecting min and max parameters to be numbers");
        }

        return Math.floor(Math.random() * max) + min;
    }

    public static binarySearch(subject: number, host: number[]): IBinarySearchResult {
        if (typeof subject !== "number" || !Array.isArray(host)) {
            throw new Error("[Utils] Expecting subject to be a number and host to be an array of numbers");
        }

        let midPoint: number = Math.round(host.length / 2);
        let pool: number[] = [...host];
        let middle: number | null = null;
        let counter: number = 0;

        while (middle !== subject) {
            midPoint = Math.round(pool.length / 2);
            middle = pool[midPoint];

            if (middle > subject) {
                pool.splice(midPoint, pool.length);
            }
            else if (middle < subject) {
                pool.splice(0, midPoint);
            }

            counter++;
        }

        return {
            iterations: counter,
            index: middle !== undefined ? midPoint : null,
            result: middle !== undefined ? middle : null,
            found: middle !== undefined
        };
    }

    public static binaryInsert(subject: number, host: number[]): number {
        if (typeof subject !== "number" || !Array.isArray(host)) {
            throw new Error("Expecting subject to be a number and host to be an array of numbers");
        }
        else if (host.length === 0) {
            return 0;
        }

        let pool: number[] = [...host];
        let midPoint: number = -1;

        while (pool.length !== 1) {
            midPoint = Math.round(pool.length / 2);

            if (pool[midPoint] > subject) {
                pool.splice(midPoint, pool.length);
            }
            else if (pool[midPoint] < subject) {
                pool.splice(0, midPoint);
            }
            else if (pool[midPoint] === undefined) {
                pool.splice(midPoint - 1, 1);
            }
            else if (pool[midPoint] === subject) {
                throw new Error("Unexpected host to already contain value");
            }
        }

        // TODO: Might fail if the host contains multiple of such elements
        return host.indexOf(pool[0]);
    }

    public static populate(amount: number): number[] {
        if (typeof amount !== "number") {
            throw new Error("Expecting amount to be a number");
        }

        const result: number[] = [];

        for (let i: number = 0; i < amount; i++) {
            result.push(i);
        }

        return result;
    }

    /**
     * Determine whether an object or string is empty or missing value
     * @param {*} input
     * @return {boolean}
     */
    public static isEmpty(input: any): boolean {
        return input === undefined || input === null || input.toString().trim() === "" || (Array.isArray(input) && input.length === 0);
    }

    /**
     * @param {string} directory The directory to scan
     * @param {boolean} [absolutePath=false] Whether to return the absolute path of the files
     * @return {Promise<string[] | null>}
     */
    public static getFiles(directory: string, absolutePath: boolean = false): Promise<string[] | null> {
        return new Promise((resolve) => {
            if (!fs.existsSync(directory)) {
                resolve(null);

                return;
            }

            fs.readdir(directory, (error: Error, files: string[]) => {
                if (error) {
                    throw new Error(`[Utils.getFiles] There was an error while reading directory '${directory}': ${error.message}`);
                }

                let result: string[] = files;

                if (absolutePath) {
                    for (let i: number = 0; i < result.length; i++) {
                        result[i] = path.resolve(path.join(directory, result[i]));
                    }
                }

                resolve(result);

                return;
            });
        });
    }

    /**
     * @param {Array<*>} array The array to shuffle
     * @return {Array<*>} The shuffled array
     */
    public static shuffle(array: any[]): any[] {
        if (!Array.isArray(array)) {
            throw new Error("Expecting parameter to be an array");
        }
        else if (array.length === 0) {
            return [];
        }

        let counter: number = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            const index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            const temp: any = array[counter];

            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    /**
     * @todo Return type
     * @param {ISendOptions} options
     * @return {Promise<Message>} The message sent
     */
    public static async send(options: ISendOptions): Promise<Message> {
        return await options.channel.send(new RichEmbed()
            .setColor(options.color ? options.color : "GREEN")
            .setTitle(options.title ? options.title : "")
            .setFooter(options.footer, options.avatarUrl)
            .setDescription(options.message)) as Message;
    }

    /**
     * @param {number} milliseconds
     * @param {number} [seconds=0]
     * @param {number} [minutes=0]
     * @param {number} [hours=0]
     * @param {number} [days=0]
     * @param {number} [months=0]
     * @param {number} [years=0]
     * @return {number}
     */
    public static timeFromNow(milliseconds: number, seconds: number = 0, minutes: number = 0, hours: number = 0, days: number = 0, months: number = 0, years: number = 0): number {
        const now: Date = new Date();

        return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
    }

    /**
     * @param {number} timestamp
     * @param {boolean} [capitalize=true] Whether to capitalize the time
     * @return {string}
     */
    public static timeAgo(timestamp: number, capitalize: boolean = true): string {
        let time: string = timeAgo.format(timestamp);

        if (capitalize) {
            time = time.charAt(0).toUpperCase() + time.slice(1);
        }

        return time;
    }

    /**
     * @param {number} timestamp
     * @return {string}
     */
    public static timeAgoFromNow(timestamp: number): string {
        return Utils.timeAgo(Date.now() - timestamp);
    }

    /**
     * @param {string} state
     * @return {boolean} Whether the state string representation was positive
     */
    public static translateState(state: string): boolean {
        return Patterns.state.test(state);
    }

    /**
     * @param {string} path
     * @param {*} data
     * @return {Promise<void>}
     */
    public static async writeJson(path: string, data: any): Promise<void> {
        return new Promise<void>((resolve) => {
            fs.writeFile(path, JSON.stringify(data), (error: Error) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * @param {string} path
     * @return {Promise<ReturnType>} The data from the specified path
     */
    public static async readJson<ReturnType = any>(path: string): Promise<ReturnType> {
        return new Promise<ReturnType>((resolve, reject) => {
            fs.readFile(path, (error: Error, data: any) => {
                if (error) {
                    reject(error);

                    return;
                }

                let parsed: ReturnType;

                try {
                    parsed = JSON.parse(data.toString());
                }
                catch (error) {
                    reject(error);

                    return;
                }

                resolve(parsed as ReturnType);
            });
        });
    }

    /**
     * @param {string} path
     * @param {*} data
     * @return {boolean}
     */
    public static writeJsonSync(path: string, data: any): boolean {
        if (!fs.existsSync(path)) {
            return false;
        }

        fs.writeFileSync(path, data);

        return true;
    }

    /**
     * @todo Check for errors
     * @param {string} path
     * @return {ReturnType | null}
     */
    public static readJsonSync<ReturnType = any>(path: string): ReturnType | null {
        return JSON.parse(fs.readFileSync(path).toString()) as ReturnType || null;
    }

    /**
     * @param {string} string The string to escape regex of
     * @return {string} The escaped string
     */
    public static escapeRegexString(string: string): string {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * @return {Promise<string>}
     */
    public static async getForgeVersion(): Promise<string> {
        // TODO:
        // return (await this.readJson("package.json")).version;

        // TODO: Hard coded
        return "2.0.0";
    }

    /**
     * @param {string} text
     * @param {Snowflake} userId
     * @return {boolean}
     */
    public static hasMentionPrefix(text: string, userId: Snowflake): boolean {
        if (!text || !userId || typeof text !== "string" || typeof userId !== "string") {
            throw new Error("Invalid data provided, expecting strings");
        }

        return text.startsWith(`<@${userId}>`) || text.startsWith(`<@!${userId}>`);
    }

    /**
     * @param {Message} message
     * @param {string[]} strings
     * @return {boolean}
     */
    public static hasStringsPrefix(message: Message, strings: string[]): boolean {
        for (let i: number = 0; i < strings.length; i++) {
            if (message.content.startsWith(strings[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {GuildMember} member
     * @return {boolean}
     */
    public static hasModerationPowers(member: GuildMember): boolean {
        for (let i: number = 0; i < moderationPermissions.length; i++) {
            if (member.hasPermission(moderationPermissions[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {Guild} guild
     * @param {string} name
     * @param {boolean} [textChannel=true]
     * @param {boolean} [caseSensitive=false]
     * @returns {GuildChannel | null}
     */
    public static findChannelByName(guild: Guild, name: string, textChannel: boolean = true, caseSensitive: boolean = false): GuildChannel | null {
        const channels: GuildChannel[] = guild.channels.array();

        for (let i: number = 0; i < channels.length; i++) {
            if (channels[i].type === "category") {
                continue;
            }

            if (!textChannel && channels[i].type === "voice") {
                continue;
            }

            if (caseSensitive && channels[i].name === name) {
                return channels[i];
            }
            else if (!caseSensitive && channels[i].name.toLowerCase() === name.toLowerCase()) {
                return channels[i];
            }
        }

        return null;
    }

    /**
     * @param {Guild} guild
     * @returns {TextChannel | null}
     */
    public static findDefaultChannel(guild: Guild): TextChannel | null {
        let channel: TextChannel | null = guild.defaultChannel || null;

        if (!channel || channel.type !== "text") {
            channel = Utils.findChannelByName(guild, "general") as TextChannel | null;

            if (!channel) {
                return null;
            }
        }

        return channel;
    }

    /**
     * @param {Guild} guild
     * @return {TextChannel | null}
     */
    public static findDefaultChannelOrAny(guild: Guild): TextChannel | null {
        const defaultChannel: TextChannel | null = Utils.findDefaultChannel(guild);

        if (defaultChannel !== null) {
            return defaultChannel;
        }

        for (const [id, channel] of guild.channels) {
            if (channel.type === "text") {
                return channel as TextChannel;
            }
        }

        return null;
    }

    /**
     * @param {string} text
     * @param {number} [maxLength=30]
     * @param {string} [suffix=" ..."]
     * @return {string} The trimmed message
     */
    public static trim(text: string, maxLength: number = 30, suffix: string = " ..."): string {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - suffix.length) + suffix;
        }

        return text;
    }

    /**
     * Determine the guild owners by searching for members with the MANAGE_GUILD permission
     * @param {Guild} guild
     * @return {GuildMember[]} The owners of the guild
     */
    public static getOwners(guild: Guild): GuildMember[] {
        return guild.members.filter((member: GuildMember) => member.hasPermission("MANAGE_GUILD")).array();
    }

    /**
     * @param {*} enumerator
     * @return {string[]}
     */
    public static getEnumKeys(enumerator: any): string[] {
        return Object.keys(enumerator).filter((key: string) => isNaN(key as any));
    }

    /**
     * Filter mentions and embeds from a message
     * @param {Message} message
     * @param {string} token
     * @return {string}
     */
    public static cleanMessage(message: Message): string {
        let filteredMessage: string = message.content;

        while (Patterns.mention.test(filteredMessage)) {
            filteredMessage = filteredMessage.replace(Patterns.mention, "[Mention]");
        }

        if (message.embeds.length > 0) {
            if (filteredMessage.length > 0) {
                filteredMessage += " ";
            }

            filteredMessage += "[Embed]";
        }

        return filteredMessage;
    }

    /**
     * Clean a string from mentions and token
     * @param {string} text
     * @param {string} token
     * @return {string} The escaped text
     */
    public static escapeText(text: string, token: string): string {
        if (!text || !token || typeof text !== "string" || typeof token !== "string") {
            throw new Error("Invalid input provided; Expecting strings");
        }

        let finalText: string = text;

        while (Patterns.anyMention.test(finalText)) {
            finalText = finalText.replace(Patterns.anyMention, "[Mention]");
        }

        while (Patterns.token.test(finalText)) {
            finalText = finalText.replace(Patterns.token, "[Token]");
        }

        while (finalText.includes(token)) {
            finalText = finalText.replace(token, "[Token]");
        }

        while (Patterns.ipv4.test(finalText)) {
            finalText = finalText.replace(Patterns.ipv4, "[IPv4]");
        }

        while (Patterns.ipv6.test(finalText)) {
            finalText = finalText.replace(Patterns.ipv6, "[IPv6]");
        }

        return finalText;
    }

    /**
     * @param {User} user
     * @return {string}
     */
    public static getUserIdentifier(user: User): string {
        if (!user || typeof user !== "object" || !user.id || !user.tag || typeof user.id !== "string" || typeof user.tag !== "string") {
            throw new Error("Invalid input; Expecting User object");
        }

        return `<@${user.id}> (${user.tag}:${user.id})`;
    }

    /**
     * @param {GuildMember} member
     * @return {string}
     */
    public static getMemberIdentifier(member: GuildMember): string {
        return Utils.getUserIdentifier(member.user);
    }
}
