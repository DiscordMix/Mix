import {Channel, Client, Emoji, Guild, GuildChannel, GuildMember, Message, MessageReaction, Role, User} from "discord.js";
import {EventEmitter} from "events";

namespace Observers {
    export class GuildObserver extends EventEmitter {
        protected readonly client: Client;
        protected readonly guild: Guild;

        public constructor(client: Client, guild: Guild) {
            super();

            this.client = client;
            this.guild = guild;
        }

        protected setupEvents(): void {
            // Message.
            this.client.on("message", (message: Message) => {
                if (message.guild && message.guild.id === this.guild.id) {
                    this.emit("message", message);
                }
            });

            // Message update.
            this.client.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
                if (oldMessage.guild && oldMessage.guild.id === this.guild.id) {
                    this.emit("messageUpdate", oldMessage, newMessage);
                }
            });

            // Message delete.
            this.client.on("messageDelete", (message: Message) => {
                if (message.guild && message.guild.id === this.guild.id) {
                    this.emit("messageDelete", message);
                }
            });

            // Message reaction add.
            this.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => {
                if (messageReaction.message.guild && messageReaction.message.guild.id === this.guild.id) {
                    this.emit("messageReactionAdd", messageReaction, user);
                }
            });

            // Message reaction remove.
            this.client.on("messageReactionRemove", (messageReaction: MessageReaction, user: User) => {
                if (messageReaction.message.guild && messageReaction.message.guild.id === this.guild.id) {
                    this.emit("messageRactionRemove", messageReaction, user);
                }
            });

            // Message reaction remove all.
            this.client.on("messageReactionRemoveAll", (message: Message) => {
                if (message.guild && message.guild.id === this.guild.id) {
                    this.emit("messageReactionRemoveAll", message);
                }
            });

            // Channel create.
            this.client.on("channelCreate", (channel: Channel) => {
                // TODO: Use .type property instead.
                if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                    this.emit("channelCreate", channel);
                }
            });

            // Channel delete.
            this.client.on("channelDelete", (channel: Channel) => {
                if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                    this.emit("channelDelete", channel);
                }
            });

            // Channel update.
            this.client.on("channelUpdate", (oldChannel: Channel, newChannel: Channel) => {
                // TODO: Use .type property instead
                if (oldChannel instanceof GuildChannel && oldChannel.guild.id === this.guild.id) {
                    this.emit("channelUpdate", oldChannel, newChannel);
                }
            });

            // Typing start.
            this.client.on("typingStart", (channel: Channel, user: User) => {
                if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                    this.emit("typingStart", channel, user);
                }
            });

            // Typing stop.
            this.client.on("typingStop", (channel: Channel, user: User) => {
                if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                    this.emit("typingStop", channel, user);
                }
            });

            // Role create.
            this.client.on("roleCreate", (role: Role) => {
                if (role.guild.id === this.guild.id) {
                    this.emit("roleCreate", role);
                }
            });

            // Role delete.
            this.client.on("roleDelete", (role: Role) => {
                if (role.guild.id === this.guild.id) {
                    this.emit("roleDelete", role);
                }
            });

            // Role update.
            this.client.on("roleUpdate", (oldRole: Role, newRole: Role) => {
                if (oldRole.guild.id === this.guild.id) {
                    this.emit("roleUpdate", oldRole, newRole);
                }
            });

            // Emoji create.
            this.client.on("emojiCreate", (emoji: Emoji) => {
                if (emoji.guild.id === this.guild.id) {
                    this.emit("emojiCreate", emoji);
                }
            });

            // Emoji delete.
            this.client.on("emojiDelete", (emoji: Emoji) => {
                if (emoji.guild.id === this.guild.id) {
                    this.emit("emojiDelete", emoji);
                }
            });

            // Emoji update.
            this.client.on("emojiUpdate", (oldEmoji: Emoji, newEmoji: Emoji) => {
                if (oldEmoji.guild.id === this.guild.id) {
                    this.emit("emojiUpdate", oldEmoji, newEmoji);
                }
            });

            // Guild ban add.
            this.client.on("guildBanAdd", (guild: Guild, user: User) => {
                if (guild.id === this.guild.id) {
                    this.emit("guildBanAdd", guild, user);
                }
            });

            // Guild ban remove.
            this.client.on("guildBanRemove", (guild: Guild, user: User) => {
                if (guild.id === this.guild.id) {
                    this.emit("guildBanRemove", guild, user);
                }
            });

            // Guild member add.
            this.client.on("guildMemberAdd", (member: GuildMember) => {
                if (member.guild.id === this.guild.id) {
                    this.emit("guildMemberAdd", member);
                }
            });

            // Guild member remove.
            this.client.on("guildMemberRemove", (member: GuildMember) => {
                if (member.guild.id === this.guild.id) {
                    this.emit("guildMemberRemove", member);
                }
            });

            // Guild member available.
            this.client.on("guildMemberAvailable", (member: GuildMember) => {
                if (member.guild.id === this.guild.id) {
                    this.emit("guildMemberAvailable", member);
                }
            });

            // Guild member speaking.
            this.client.on("guildMemberSpeaking", (member: GuildMember) => {
                if (member.guild.id === this.guild.id) {
                    this.emit("guildMemberSpeaking", member);
                }
            });

            // Guild create.
            this.client.on("guildCreate", (guild: Guild) => {
                if (guild.id === this.guild.id) {
                    this.emit("guildCreate", guild);
                }
            });

            // Guild delete.
            this.client.on("guildDelete", (guild: Guild) => {
                if (guild.id === this.guild.id) {
                    this.emit("guildDelete", guild);
                }
            });

            // Guild update.
            this.client.on("guildUpdate", (oldGuild: Guild, newGuild: Guild) => {
                if (oldGuild.id === this.guild.id) {
                    this.emit("guildUpdate", oldGuild, newGuild);
                }
            });

            // Guild unavailable.
            this.client.on("guildUnavailable", (guild: Guild) => {
                if (guild.id === this.guild.id) {
                    this.emit("guildUnavailable");
                }
            });
        }
    }
}
