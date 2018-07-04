import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import {GuildMember, RichEmbed} from "discord.js";
import Utils from "../../../core/utils";

const command: CommandOptions = {
    meta: {
        name: "whois",
        desc: "View information about a user",

        args: {
            user: "!:member"
        }
    },

    executed: async (context: CommandExecutionContext): Promise<void> => {
        const member: GuildMember = context.arguments[0];

        if (!member) {
            context.fail("User not found");

            return;
        }

        const roles = member.roles.array();

        let finalRoles = roles.slice(0, 10).map((role) => `<@&${role.id}>`).join(" ");

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
            .addField("Roles", finalRoles)
            .addField("Id", member.id));
    }
};

export default command;
