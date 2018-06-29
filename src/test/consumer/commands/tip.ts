import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

const tips = [
    "You can click on member's names to view which games they play (by their roles)",
    "There's a secret channel in the server -- see if you can find it!",
    "Head over to the #roles channel to view all available roles!",
    "We do have a hidden NSFW channel, feel free to ask access for it!",
    "Careful not to ping partners or special guests!",
    "Are you a bot developer? You can invite up to 2 bots to this server",
    "Are you a streamer/content creator? Make sure to post your channel link in the #creators channel!",
    "We're working on a website for the server!",
    "Do you have a server with more than 150 members? Contact an online Partnership Manager to partner!",
    "Discord invites are not allowed! Careful not to post them",
    "You can vote for what you'd like to see (or not to see) in the server in the #council channel",
    "We do regular giveaways, make sure to keep an eye on the #giveaways channel!",
    "Did you know? Cookie is a very special role!",
    "Did you know? You can earn stars by being active in the server!",
    "We're constantly adding roles for popular games!",
    "If you ever have questions about development, feel free to post them in #development",
    "Did you know? This server started as a private developer/friends-only community!",
    "Did you know? This server has been around for over a year now!",
    "Did you know? If we catch you playing a game, we add the role if we have it!",
    "Did you know? Staff applications open as the server grows, so stay tuned!",
    "Do you love anime? So do we! Make sure to checkout the #anime-recommendations channel for good quality anime to watch",
    "Do you have a favorite anime? You can talk to Atlas to add it to the #anime-recommendations channel!",
    "Do you have any questions about the server? Feel free to ask an online Assistant, or Atlas himself!",
    "Have something to spare? Talk to Atlas to make a giveaway!",
    "We're planning to start hosting DJ events soon!",
    "You can post memes in the #media channel!",
    "We host events randomly! Stay tuned and keep an eye under the Events category for special event channels"
];

const command: CommandOptions = {
    meta: {
        name: "tip",
        desc: "View a random tip"
    },

    restrict: {
        cooldown: 5
    },

    executed: (context: CommandExecutionContext, api: any): void => {
        const tipIndex = api.getRandomInt(0, tips.length);

        context.ok(tips[tipIndex], `Tip #${tipIndex + 1}`);
    }
};

export default command;
