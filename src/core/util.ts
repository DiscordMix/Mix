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
import Pattern from "./pattern";
import Log from "./log";
import {IBot} from "./botExtra";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.locale(en);

const timeAgo: any = new TimeAgo("en-US");

/**
 * All permissions which only server staff
 * and moderation roles can have access to.
 */
const moderationPermissions: PermissionResolvable[] = [
    "MANAGE_GUILD",
    "ADMINISTRATOR",
    "BAN_MEMBERS",
    "KICK_MEMBERS",
    "MANAGE_CHANNELS",
    "MANAGE_MESSAGES",
    "MANAGE_ROLES_OR_PERMISSIONS"
];

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

export default abstract class Util {
    public static readonly botLists: ReadonlyMap<Snowflake, string> = new Map([
        ["374071874222686211", "botsfordiscord.com"],
        ["264445053596991498", "discordbots.org"],
        ["387812458661937152", "botlist.space"],
        ["483344253963993113", "automacord.xyz"],
        ["446425626988249089", "bots.ondiscord.xyz"],
        ["528352472389910529", "botsparadiscord.xyz"],
        ["112319935652298752", "carbonitex.net"],
        ["402400730922876930", "dankbotlist.com"],
        ["439866052684283905", "discord.boats"],
        ["421630709585805312", "discordboats.club"],
        ["450100127256936458", "discordbotlist.com"],
        ["500658335217876997", "discordbotreviews.xyz"],
        ["396440418507816960", "discordbot.world"],
        ["110373943822540800", "discord.bots.gg"],
        ["494311015484358687", "discordbotslist.us.to"],
        ["501017909389295616", "discordbots.fr"]
    ]);

    /**
     * Strip a Snowflake into its bare ID.
     */
    public static resolveId(mention: string): string {
        if (typeof mention !== "string") {
            throw Log.error("Expecting mention parameter to be a string");
        }

        return mention
            .replace("<", "")
            .replace(">", "")
            .replace("@", "")
            .replace("!", "")
            .replace("&", "")
            .replace("#", "");
    }

    public static spreadTime(time: number, delimiter: string = " "): string {
        if (typeof time !== "number" || typeof delimiter !== "string") {
            throw Log.error("Expecting time parameter to be a number and delimiter parameter to be a string");
        }

        const timeStr: string = time.toString();
        const result: string[] = timeStr.split("");

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

    /**
     * Determine the percentage of the input value compared to its max value.
     * @return {number} The computed percentage.
     */
    public static percentOf(amount: number, max: number): number {
        if (amount < 0 || max < 0) {
            throw Log.error("Expecting parameters to be neutral or positive numbers");
        }

        // Prevent overflows by dividing by zero.
        if (max === 0) {
            if (amount === 0) {
                return 100;
            }

            return 0;
        }

        return Math.round(amount / max * 100);
    }

    // TODO: Needs testing.
    public static createTimedAction<ReturnType = any>(bot: IBot, action: () => ReturnType, timeout: number, timeoutResult: ReturnType | any): Promise<ReturnType> {
        return new Promise(async (resolve) => {
            // TODO: Is this required?
            let stopFlag: boolean = false;

            const timer: NodeJS.Timeout = await bot.setTimeout(() => {
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
     * Generate a random number between a range.
     * @param {number} min The minimum amount.
     * @param {number} max The maximum amount.
     * @return {number} The generated random number.
     */
    public static getRandomInt(min: number, max: number): number {
        if (typeof min !== "number" || typeof max !== "number" || min > max || min === max) {
            throw Log.error("Expecting min and max parameters to be numbers");
        }

        return Math.floor(Math.random() * max) + min;
    }

    /**
     * Performs the binary search algorithm on the host array.
     * @return {IBinarySearchResult} An object containing the results of the operation.
     */
    public static binarySearch(subject: number, host: number[]): IBinarySearchResult {
        if (typeof subject !== "number" || !Array.isArray(host)) {
            throw Log.error("Expecting subject to be a number and host to be an array of numbers");
        }

        const pool: number[] = [...host];

        let midPoint: number = Math.round(host.length / 2);
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
            throw Log.error("Expecting subject to be a number and host to be an array of numbers");
        }
        else if (host.length === 0) {
            return 0;
        }

        const pool: number[] = [...host];

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
                throw Log.error("Unexpected host to already contain value");
            }
        }

        // TODO: Might fail if the host contains multiple of such elements.
        return host.indexOf(pool[0]);
    }

    /**
     * Creates an array of numbers.
     * @param {number} amount The amount of elements.
     * @return {number[]} The generated array.
     */
    public static populate(amount: number): number[] {
        if (typeof amount !== "number") {
            throw Log.error("Expecting amount to be a number");
        }

        const result: number[] = [];

        for (let i: number = 0; i < amount; i++) {
            result.push(i);
        }

        return result;
    }

    /**
     * Determine whether an object or string is empty or missing value.
     * @return {boolean} Whether the input is empty.
     */
    public static isEmpty(input: any): boolean {
        return input === undefined
            || input === null
            || input.toString().trim() === ""
            || (Array.isArray(input) && input.length === 0)
            || typeof input === "object" && Object.keys(input).length === 0;
    }

    /**
     * @param {string} directory The directory to scan.
     * @param {boolean} [absolutePath=false] Whether to return the absolute path of the files.
     * @return {Promise<string[] | null>} The list of files or null of the directory does not exist.
     */
    public static getFiles(directory: string, absolutePath: boolean = false): Promise<string[] | null> {
        return new Promise((resolve) => {
            if (!fs.existsSync(directory)) {
                resolve(null);

                return;
            }

            fs.readdir(directory, (error: Error, files: string[]) => {
                if (error) {
                    throw Log.error(`There was an error while reading directory '${directory}': ${error.message}`);
                }

                const result: string[] = files;

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
     * Shuffle the items of an array into random positions.
     * @param {Array<*>} array The array to shuffle.
     * @return {Array<*>} The shuffled array.
     */
    public static shuffle(array: any[]): any[] {
        if (!Array.isArray(array)) {
            throw Log.error("Expecting parameter to be an array");
        }
        else if (array.length === 0) {
            return [];
        }

        let counter: number = array.length;

        // While there are elements in the array.
        while (counter > 0) {
            // Pick a random index.
            const index = Math.floor(Math.random() * counter);

            // Decrease counter by 1.
            counter--;

            // And swap the last element with it.
            const temp: any = array[counter];

            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    /**
     * Send a formatted embed message to the specified channel.
     * @return {Promise<Message>} The message sent.
     */
    public static async send(options: ISendOptions): Promise<Message> {
        return await options.channel.send(new RichEmbed()
            .setColor(options.color ? options.color : "GREEN")
            .setTitle(options.title ? options.title : "")
            .setFooter(options.footer, options.avatarUrl)
            .setDescription(options.message)) as Message;
    }

    public static timeFromNow(milliseconds: number, seconds: number = 0, minutes: number = 0, hours: number = 0, days: number = 0, months: number = 0, years: number = 0): number {
        const now: Date = new Date();

        return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
    }

    /**
     * Compute the string representation of the provided past timestamp.
     * @param {boolean} [capitalize=true] Whether to capitalize the time.
     */
    public static timeAgo(timestamp: number, capitalize: boolean = true): string {
        let time: string = timeAgo.format(timestamp);

        if (capitalize) {
            time = time.charAt(0).toUpperCase() + time.slice(1);
        }

        return time;
    }

    public static timeAgoFromNow(timestamp: number): string {
        return Util.timeAgo(Date.now() - timestamp);
    }

    /**
     * Write data into a JSON file.
     */
    public static async writeJson(filePath: string, data: any): Promise<void> {
        return new Promise<void>((resolve) => {
            fs.writeFile(filePath, JSON.stringify(data), (error: Error) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * Read data from a JSON file.
     * @return {Promise<ReturnType>} The data from the specified path.
     */
    public static async readJson<ReturnType = any>(filePath: string): Promise<ReturnType> {
        return new Promise<ReturnType>((resolve, reject) => {
            fs.readFile(filePath, (error: Error, data: any) => {
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

                resolve(parsed);
            });
        });
    }

    /**
     * Write data into a JSON file synchronously.
     */
    public static writeJsonSync(filePath: string, data: any): boolean {
        if (!fs.existsSync(filePath)) {
            return false;
        }

        fs.writeFileSync(filePath, data);

        return true;
    }

    // TODO: Check for errors.
    /**
     * Read data from a JSON file synchronously.
     */
    public static readJsonSync<ReturnType = any>(filePath: string): ReturnType | null {
        return JSON.parse(fs.readFileSync(filePath).toString()) as ReturnType || null;
    }

    /**
     * @param {string} str The string to escape regex of.
     * @return {string} The escaped string.
     */
    public static escapeRegexString(str: string): string {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * Retrive Mix's current package version.
     */
    public static async getMixVersion(): Promise<string> {
        // TODO
        // return (await this.readJson("package.json")).version;

        // TODO: Hard coded.
        return "1.2.5";
    }

    /**
     * Determine if input text mentions input Snowflake.
     */
    public static hasMentionPrefix(text: string, userId: Snowflake): boolean {
        if (!text || !userId || typeof text !== "string" || typeof userId !== "string") {
            throw Log.error("Invalid data provided, expecting strings");
        }

        return text.startsWith(`<@${userId}>`) || text.startsWith(`<@!${userId}>`);
    }

    public static hasStringsPrefix(message: Message, strings: string[]): boolean {
        for (const str of strings) {
            if (message.content.startsWith(str)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Uses random number generation to assert chance.
     */
    public static chance(range: number): boolean {
        if (typeof range !== "number" || range <= 0) {
            throw Log.error("Expecting range parameter to be a number and to be higher than 0");
        }

        return Util.getRandomInt(0, range) === 0;
    }

    /**
     * Determine if a guild member has moderation powers
     * such as managing messages and/or kicking members.
     */
    public static hasModerationPowers(member: GuildMember): boolean {
        for (const perm of moderationPermissions) {
            if (member.hasPermission(perm)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Attempt to find a guild channel by name.
     */
    public static findChannelByName(guild: Guild, name: string, textChannel: boolean = true, caseSensitive: boolean = false): GuildChannel | null {
        const channels: GuildChannel[] = guild.channels.array();

        for (const channel of channels) {
            if (channel.type === "category") {
                continue;
            }

            if (!textChannel && channel.type === "voice") {
                continue;
            }

            if (caseSensitive && channel.name === name) {
                return channel;
            }
            else if (!caseSensitive && channel.name.toLowerCase() === name.toLowerCase()) {
                return channel;
            }
        }

        return null;
    }

    /**
     * Attempt to find a default or general
     * channel in the specified guild.
     */
    public static findDefaultChannel(guild: Guild): TextChannel | null {
        let channel: TextChannel | null = guild.defaultChannel || null;

        if (!channel || channel.type !== "text") {
            channel = Util.findChannelByName(guild, "general") as TextChannel | null;

            if (!channel) {
                return null;
            }
        }

        return channel;
    }

    public static findDefaultChannelOrAny(guild: Guild): TextChannel | null {
        const defaultChannel: TextChannel | null = Util.findDefaultChannel(guild);

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
     * Trim a string.
     * @return {string} The trimmed message.
     */
    public static trim(text: string, maxLength: number = 30, suffix: string = " ..."): string {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - suffix.length) + suffix;
        }

        return text;
    }

    /**
     * Determine the guild owner(s) by searching
     * for members with the 'MANAGE_GUILD' permission.
     * @return {GuildMember[]} An array containing the owner(s) of the guild.
     */
    public static getOwners(guild: Guild): GuildMember[] {
        return guild.members.filter((member: GuildMember) => member.hasPermission("MANAGE_GUILD")).array();
    }

    /**
     * Extract the object keys of a TypeScript enum.
     */
    public static getEnumKeys(enumerator: any): string[] {
        return Object.keys(enumerator).filter((key: string) => isNaN(key as any));
    }

    /**
     * Filter mentions and embeds from a message.
     */
    public static cleanMessage(message: Message): string {
        let filteredMessage: string = message.content;

        while (Pattern.mention.test(filteredMessage)) {
            filteredMessage = filteredMessage.replace(Pattern.mention, "[Mention]");
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
     * Clean a string from mentions and tokens.
     * @return {string} The escaped text.
     */
    public static escapeText(text: string, token: string): string {
        if (!text || !token || typeof text !== "string" || typeof token !== "string") {
            throw Log.error("Invalid input provided; Expecting strings");
        }

        let finalText: string = text;

        while (Pattern.anyMention.test(finalText)) {
            finalText = finalText.replace(Pattern.anyMention, "[Mention]");
        }

        while (Pattern.token.test(finalText)) {
            finalText = finalText.replace(Pattern.token, "[Token]");
        }

        while (finalText.includes(token)) {
            finalText = finalText.replace(token, "[Token]");
        }

        while (Pattern.ipv4.test(finalText)) {
            finalText = finalText.replace(Pattern.ipv4, "[IPv4]");
        }

        while (Pattern.ipv6.test(finalText)) {
            finalText = finalText.replace(Pattern.ipv6, "[IPv6]");
        }

        return finalText;
    }

    public static getUserIdentifier(user: User): string {
        if (!user || typeof user !== "object" || !user.id || !user.tag || typeof user.id !== "string" || typeof user.tag !== "string") {
            throw Log.error("Invalid input; Expecting User object");
        }

        return `<@${user.id}> (${user.tag}:${user.id})`;
    }

    public static getMemberIdentifier(member: GuildMember): string {
        return Util.getUserIdentifier(member.user);
    }

    /**
     * Hash a Snowflake into a unique, persistent number.
     * @return {number} A number lower or equal to the max.
     */
    public static hash(id: Snowflake, max: number, precision: number = 6): number {
        return parseInt(id.substr(0, precision)) % max;
    }
}
