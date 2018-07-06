import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {GuildMember, RichEmbed} from "discord.js";
import Utils from "../../../core/utils";

export default <CommandOptions>{
    meta: {
        name: "whois",
        desc: "View information about a user",

        args: {
            user: ":member"
        }
    },

    executed: async (context: CommandContext): Promise<void> => {
        const member: GuildMember = context.arguments.length > 0 ? context.arguments[0] : context.message.member;

        if (!member) {
            context.fail("User not found");

            return;
        }

        const roles = member.roles.array();

        let finalRoles = roles.slice(1, 10).map((role) => `<@&${role.id}>`).join(" ");

        if (roles.length > 10) {
            finalRoles += ` **+ ${roles.length - 10} more**`;
        }

        await context.message.channel.send(new RichEmbed()
            .setColor("GREEN")
            .setFooter(`Requested by ${context.sender.username}`, context.sender.avatarURL)
            .setThumbnail(member.user.avatarURL)
            .addField("User", `<@${member.user.id}>`)
            .addField("Tag", member.user.tag)
            .addField("Nickname", member.nickname ? member.nickname : "*None*")
            .addField("Type", member.user.bot ? ":robot: Bot" : ":raising_hand: Human")
            .addField("Joined Server", Utils.timeAgo(member.joinedTimestamp))
            .addField("Account Created", Utils.timeAgo(member.user.createdTimestamp))
            .addField("Last Message", member.lastMessage ? member.lastMessage.content : "*None*")
            .addField(`Roles [${roles.length - 1}]`, finalRoles)
            .addField("User ID", member.id));
    }
};
