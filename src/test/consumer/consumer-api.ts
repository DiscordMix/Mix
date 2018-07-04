import {GuildMember, Message, RichEmbed, Snowflake, TextChannel, User} from "discord.js";
import Log from "../../core/log";
import JsonStore from "../../data-stores/json-store";

const reviewChannelId = "462109996260261899";

const badWords = [
    "asshole",
    "fuck",
    "bitch",
    "shit",
    "slut",
    "whore",
    "anus",
    "dick",
    "bastard",
    "cunt",
    "pussy",
    "cock"
];

const racialSlurs = [
    "nigger",
    "nigga",
    "zipperhead",
    "bobo",
    "amigo",
    "blaxican",
    "brownie",
    "faggot"
];

export interface WarnOptions {
    readonly user: GuildMember;
    readonly moderator: User;
    readonly reason: string;
    readonly channel: any;
    readonly message: Message;
    readonly evidence?: string;
}

export interface MuteOptions {
    readonly user: GuildMember;
    readonly moderator: User;
    readonly reason: string;
    readonly channel: any;
    readonly message: Message;
    readonly evidence?: string;
}

const SuspectedViolation: any = {
    Long: "Long",
    ExcessiveProfanity: "Excessive Profanity",
    Sexism: "Sexism",
    Spamming: "Spamming",
    MassMentions: "Mass Mentions",
    MultipleNewLines: "Multiple New Lines",
    Advertising: "Advertising",
    RacialSlurs: "Racial Slurs",
    None: "None"
};

export interface CaseOptions {
    readonly member: GuildMember;
    readonly color: string;
    readonly reason: string;
    readonly moderator: User;
    readonly title: string;
    readonly evidence?: string;
}

export default abstract class ConsumerAPI {
    static deletedMessages: any = [];
    static store: JsonStore;
    static caseCounter: number;
    static modLogChannel: TextChannel;

    static async reportCase(options: CaseOptions): Promise<void> {
        const caseNum = ConsumerAPI.getCase();

        const embed = new RichEmbed()
            .setColor(options.color)
            .setAuthor(`Case #${caseNum} | ${options.title}`, options.member.user.avatarURL)
            .addField("User", `<@${options.member.user.id}> (${options.member.user.tag})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.tag})`)
            .addField("Time", "*Permanent*")
            .setFooter(`Requested by ${options.moderator.username}`, options.moderator.avatarURL);

        if (options.evidence) {
            embed.setThumbnail(options.evidence);
        }

        ConsumerAPI.modLogChannel.send(embed);
    }

    static async warn(options: WarnOptions): Promise<boolean> {
        if (!(options.channel instanceof TextChannel)) {
            Log.error("[ConsumerAPI.warn] Expecting channel to be of type 'TextChannel'");

            return false;
        }

        const caseNum: number = ConsumerAPI.getCase();

        options.channel.send(new RichEmbed()
            .setTitle(`Warn | Case #${caseNum}`)
            .addField("Member", `<@${options.user.id}> (${options.user.user.username})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.username})`)
            .setThumbnail(options.evidence ? options.evidence : "")
            .setFooter(`Warned by ${options.moderator.username}`, options.moderator.avatarURL)
            .setColor("GOLD"));

        (await options.user.createDM()).send(new RichEmbed()
            .setDescription(`You were warned by <@${options.moderator.id}> (${options.moderator.username}) for **${options.reason}**`)
            .setColor("GOLD")
            .setTitle(`Case #${caseNum}`));

        if (options.message.deletable) {
            await options.message.delete();
        }

        return true;
    }

    static async mute(options: MuteOptions): Promise<void> {
        await options.user.addRole(options.user.guild.roles.find("name", "Muted"));

        const caseNum: number = ConsumerAPI.getCase();

        options.channel.send(new RichEmbed()
            .setTitle(`Mute | Case #${caseNum}`)
            .addField("Member", `<@${options.user.id}> (${options.user.user.username})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.username})`)
            .setThumbnail(options.evidence ? options.evidence : "")
            .setFooter(`Muted by ${options.moderator.username}`, options.moderator.avatarURL)
            .setColor("BLUE"));

        (await options.user.createDM()).send(new RichEmbed()
            .setDescription(`You were muted by <@${options.moderator.id}> (${options.moderator.username}) for **${options.reason}**`)
            .setColor("BLUE")
            .setTitle(`Case #${caseNum}`));
    }

    static getCase(): number {
        ConsumerAPI.caseCounter++;

        ConsumerAPI.store.set("case_counter", ConsumerAPI.caseCounter);

        return ConsumerAPI.caseCounter - 1;
    }

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static countBadWords(message: string): number {
        let count = 0;

        for (let i = 0; i < badWords.length; i++) {
            const matches = message.match(new RegExp(badWords[i], "gi"));

            if (matches) {
                count += matches.length;
            }
        }

        return count;
    }

    static containsRacialSlurs(message: string): boolean {
        for (let i = 0; i < racialSlurs.length; i++) {
            if (message.toLowerCase().includes(racialSlurs[i])) {
                return true;
            }
        }

        return false;
    }

    static isMessageSuspicious(message: Message): string {
        if (message.content.length > 500) {
            return SuspectedViolation.Long;
        }
        else if (message.mentions.users.size > 3) {
            return SuspectedViolation.MassMentions;
        }
        else if (!message.author.bot && message.content.split("\n").length > 2) {
            return SuspectedViolation.MultipleNewLines;
        }
        else if (this.countBadWords(message.content) > 2) {
            return SuspectedViolation.ExcessiveProfanity;
        }
        else if (this.containsRacialSlurs(message.content)) {
            return SuspectedViolation.RacialSlurs;
        }

        // TODO: Add missing checks

        return SuspectedViolation.None;
    }

    static getLastDeletedMessage(channelId: Snowflake): Message | null {
        if (ConsumerAPI.deletedMessages[channelId]) {
            return ConsumerAPI.deletedMessages[channelId];
        }

        return null;
    }

    static async flagMessage(message: Message, suspectedViolation: string): Promise<void> {
        const reviewChannel: any = message.guild.channels.get(reviewChannelId);

        if (!reviewChannel) {
            Log.error("[ConsumerAPI.flagMessage] Review channel does not exist, failed to flag message");

            return;
        }

        await reviewChannel.send(new RichEmbed()
            .setTitle("Suspicious Message")
            .addField("Sender", `<@${message.author.id}> (${message.author.username})`)
            .addField("Message", message.content)
            .addField("Channel", `<#${message.channel.id}>`)
            .addField("Suspected Violation", suspectedViolation)
            .addField("Message ID", message.id));

        return;
    }
}
