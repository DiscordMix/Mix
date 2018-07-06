import {BehaviourOptions} from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {Guild, GuildMember, User} from "discord.js";
import Utils from "../../../core/utils";

const messages: any = {
    welcome: [
        "Let the party start, {user} has joined",
        "Your {user} has arrived",
        "A new {user} has emerged",
        "The prophecy was fulfilled, {user} has arrived",
        "We were expecting you, {user}",
        "You ready for some games, {user}?",
        "We're happy you're here, {user}!",
        "{user} has joined your party",
        "Hey everybody, please welcome {user}!",
        "A new friendo has arrived: {user}",
        "{user} is here, act busy!",
        "{user} has arrived in a parachute",
        "{user} is here to play Fortnite",
        "{user} is here for the cake",
        "You must place {user} in a pylon field",
        "{user} has joined, maximum capacity reached",
        "Prepare another suit, {user} is here",
        "{user} has suddenly appeared",
        "Awesomeness at 100% | Cause: {user} has arrived",
        "We'll need more roles, {user} has arrived",
        "A suspicious {user} has joined the server",
        "{user} sneaked his way into the server",
        "Call security, {user} is here",
        "Somebody called for a {user}?",
        "{user} is now part of the sauce",
        "{user} is now your friend",
        "{user} has added you to their friends-list",
        "{user} suddenly appeared",
        "{user} just came out of your closet",
        "{user} was hiding under your bed",
        "The sea has washed {user} to shore",
        "{user} has achieved transcendence",
        "owo {user} is here"
    ],

    goodbye: [
        "{user} doesn't like games",
        "We're sad to see you go, {user}",
        "'Till next time, {user}",
        "We'll miss you, {user}",
        "We had a great time with you, {user}",
        "Goodbye, {user}",
        "Take care, {user}",
        "We hope to see you again someday, {user}",
        "Thanks for being a part of our community, {user}",
        "We hope you had a great time here, {user}",
        "Come back anytime, {user}",
        "Everybody, say goodbye to {user}",
        "Hope you had fun here, {user}",
        "Good luck, {user}!",
        "See you around, {user}",
        "The storm has taken {user} with them",
        "{user} has suddenly gone missing",
        "{user} was abducted by aliens",
        "{user} went to the bathroom and never came back",
        "{user} accidentally left the server",
        "{user} was forgotten",
        "{user} is gone forever",
        "{user} was never here",
        "{user} is no more",
        "The {user} was a lie"
    ]
};

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMessage(category: string, user: User): string {
    return messages[category][getRandomInt(0, messages[category].length)].replace(/\{user\}/g, `<@${user.id}>`);
}

const sendGeneral = (text: string, titleSuffix: string, member: GuildMember, color = "GREEN") => {
    Utils.send({
        title: `Member ${titleSuffix}`,
        color: color,
        footer: `${member.guild.memberCount} members`,
        user: member.user,
        channel: member.guild.channels.get("286352649610199052"), // General
        message: text
    });
};

export default <BehaviourOptions>{
    name: "Welcome & Leave",

    enabled: (bot: Bot) => {
        bot.client.on("guildMemberAdd", (member: GuildMember) => {
            sendGeneral(`${getMessage("welcome", member.user)}\n\n*Make sure to read the <#458708940809699368>!*`, "Joined", member);
        });

        bot.client.on("guildMemberRemove", (member: GuildMember) => {
            sendGeneral(getMessage("goodbye", member.user), "Left", member);
        });
    }
};
