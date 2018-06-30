import {GuildMember, Message, RichEmbed, Snowflake, TextChannel, User} from "discord.js";
import Log from "../../core/log";

const reviewChannelId = "462109996260261899";

const badWords = [
    "asshole",
    "fuck",
    "bitch",
    "shit",
    "slut"
];

const racialSlurs = [
    "nigger"
];

let caseCounter: number = 0;

export interface WarnOptions {
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
    None: "None"
};

export default abstract class ConsumerAPI {
    static deletedMessages: any = [];

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
            options.message.delete();
        }

        return true;
    }

    static getCase(): number {
        caseCounter++;

        return caseCounter - 1;
    }

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static countBadWords(message: string): number {
        let count = 0;

        for (let i = 0; i < badWords.length; i++) {
            console.log(new RegExp(badWords[i], "gi").ma);

            if (message.includes(badWords[i])) {
                count++;
            }
        }

        return count;
    }

    static isMessageSuspicious(message: Message): string {
        if (message.content.length > 500) {
            return SuspectedViolation.Long;
        }
        else if (message.mentions.users.size > 3) {
            return SuspectedViolation.MassMentions;
        }
        else if (message.content.split("\n").length > 2) {
            return SuspectedViolation.MultipleNewLines;
        }
        else if (this.countBadWords(message.content) > 2) {
            return SuspectedViolation.ExcessiveProfanity;
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
