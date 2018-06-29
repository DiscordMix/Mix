import {GuildMember, Message, RichEmbed, TextChannel, User} from "discord.js";
import Log from "../../core/log";

const reviewChannelId = "462109996260261899";

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
    HeavyProfanity: "Heavy Profanity",
    Sexism: "Sexism",
    Spamming: "Spamming",
    MassMentions: "Mass Mentions",
    Advertising: "Advertising",
    None: "None"
};

export default abstract class ConsumerAPI {
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

    static isMessageSuspicious(message: Message): string {
        if (message.content.length > 500) {
            return SuspectedViolation.Long;
        }
        else if (message.mentions.users.size > 3) {
            return SuspectedViolation.MassMentions;
        }

        // TODO: Add missing checks

        return SuspectedViolation.None;
    }

    static flagMessage(message: Message, suspectedViolation: string): void {
        const reviewChannel: any = message.guild.channels.get(reviewChannelId);

        if (!reviewChannel) {
            Log.error("[ConsumerAPI.flagMessage] Review channel does not exist, failed to flag message");

            return;
        }

        reviewChannel.send(new RichEmbed()
            .setTitle("Suspicious Message")
            .addField("Sender", `<@${message.author.id}> (${message.author.username})`)
            .addField("Message", message.content)
            .addField("Channel", `<#${message.channel.id}>`)
            .addField("Suspected Violation", suspectedViolation)
            .addField("Message ID", message.id));
    }
}
