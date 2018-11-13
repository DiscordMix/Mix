import {Guild, Client, Message, MessageReaction, User, Channel, GuildChannel, Role, Emoji, GuildMember} from "discord.js";
import {EventEmitter} from "events";

export default class GuildObserver extends EventEmitter {
    private readonly client: Client;
    private readonly guild: Guild;

    /**
     * @param {Client} client
     * @param {Guild} guild
     */
    public constructor(client: Client, guild: Guild) {
        super();

        /**
         * @type {Client}
         * @private
         * @readonly
         */
        this.client = client;

        /**
         * @type {Guild}
         * @private
         * @readonly
         */
        this.guild = guild;
    }

    private setupEvents(): void {
        // Message
        this.client.on("message", (message: Message) => {
            if (message.guild && message.guild.id === this.guild.id) {
                this.emit("message", message);
            }
        });

        // Message Update
        this.client.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
            if (oldMessage.guild && oldMessage.guild.id === this.guild.id) {
                this.emit("messageUpdate", oldMessage, newMessage);
            }
        });

        // Message Delete
        this.client.on("messageDelete", (message: Message) => {
            if (message.guild && message.guild.id === this.guild.id) {
                this.emit("messageDelete", message);
            }
        });

        // Message Reaction Add
        this.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => {
            if (messageReaction.message.guild && messageReaction.message.guild.id === this.guild.id) {
                this.emit("messageReactionAdd", messageReaction, user);
            }
        });

        // Message Reaction Remove
        this.client.on("messageReactionRemove", (messageReaction: MessageReaction, user: User) => {
            if (messageReaction.message.guild && messageReaction.message.guild.id === this.guild.id) {
                this.emit("messageRactionRemove", messageReaction, user);
            }
        });

        // Message Reaction Remove All
        this.client.on("messageReactionRemoveAll", (message: Message) => {
            if (message.guild && message.guild.id === this.guild.id) {
                this.emit("messageReactionRemoveAll", message);
            }
        });

        // Channel Create
        this.client.on("channelCreate", (channel: Channel) => {
            // TODO: Use .type property instead
            if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                this.emit("channelCreate", channel);
            }
        });

        // Channel Delete
        this.client.on("channelDelete", (channel: Channel) => {
            if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                this.emit("channelDelete", channel);
            }
        });

        // Channel Update
        this.client.on("channelUpdate", (oldChannel: Channel, newChannel: Channel) => {
            // TODO: Use .type property instead
            if (oldChannel instanceof GuildChannel && oldChannel.guild.id === this.guild.id) {
                this.emit("channelUpdate", oldChannel, newChannel);
            }
        });

        // Typing Start
        this.client.on("typingStart", (channel: Channel, user: User) => {
            if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                this.emit("typingStart", channel, user);
            }
        });

        // Typing Stop
        this.client.on("typingStop", (channel: Channel, user: User) => {
            if (channel instanceof GuildChannel && channel.guild.id === this.guild.id) {
                this.emit("typingStop", channel, user);
            }
        });

        // Role Create
        this.client.on("roleCreate", (role: Role) => {
            if (role.guild.id === this.guild.id) {
                this.emit("roleCreate", role);
            }
        });

        // Role Delete
        this.client.on("roleDelete", (role: Role) => {
            if (role.guild.id === this.guild.id) {
                this.emit("roleDelete", role);
            }
        });

        // Role Update
        this.client.on("roleUpdate", (oldRole: Role, newRole: Role) => {
            if (oldRole.guild.id === this.guild.id) {
                this.emit("roleUpdate", oldRole, newRole);
            }
        });

        // Emoji Create
        this.client.on("emojiCreate", (emoji: Emoji) => {
            if (emoji.guild.id === this.guild.id) {
                this.emit("emojiCreate", emoji);
            }
        });

        // Emoji Delete
        this.client.on("emojiDelete", (emoji: Emoji) => {
            if (emoji.guild.id === this.guild.id) {
                this.emit("emojiDelete", emoji);
            }
        });

        // Emoji Update
        this.client.on("emojiUpdate", (oldEmoji: Emoji, newEmoji: Emoji) => {
            if (oldEmoji.guild.id === this.guild.id) {
                this.emit("emojiUpdate", oldEmoji, newEmoji);
            }
        });

        // Guild Ban Add
        this.client.on("guildBanAdd", (guild: Guild, user: User) => {
            if (guild.id === this.guild.id) {
                this.emit("guildBanAdd", guild, user);
            }
        });

        // Guild Ban Remove
        this.client.on("guildBanRemove", (guild: Guild, user: User) => {
            if (guild.id === this.guild.id) {
                this.emit("guildBanRemove", guild, user);
            }
        });

        // Guild Member Add
        this.client.on("guildMemberAdd", (member: GuildMember) => {
            if (member.guild.id === this.guild.id) {
                this.emit("guildMemberAdd", member);
            }
        });

        // Guild Member Remove
        this.client.on("guildMemberRemove", (member: GuildMember) => {
            if (member.guild.id === this.guild.id) {
                this.emit("guildMemberRemove", member);
            }
        });

        // Guild Member Available
        this.client.on("guildMemberAvailable", (member: GuildMember) => {
            if (member.guild.id === this.guild.id) {
                this.emit("guildMemberAvailable", member);
            }
        });

        // Guild Member Speaking
        this.client.on("guildMemberSpeaking", (member: GuildMember) => {
            if (member.guild.id === this.guild.id) {
                this.emit("guildMemberSpeaking", member);
            }
        });

        // Guild Create
        this.client.on("guildCreate", (guild: Guild) => {
            if (guild.id === this.guild.id) {
                this.emit("guildCreate", guild);
            }
        });

        // Guild Delete
        this.client.on("guildDelete", (guild: Guild) => {
            if (guild.id === this.guild.id) {
                this.emit("guildDelete", guild);
            }
        });

        // Guild Update
        this.client.on("guildUpdate", (oldGuild: Guild, newGuild: Guild) => {
            if (oldGuild.id === this.guild.id) {
                this.emit("guildUpdate", oldGuild, newGuild);
            }
        });

        // Guild Unavailable
        this.client.on("guildUnavailable", (guild: Guild) => {
            if (guild.id === this.guild.id) {
                this.emit("guildUnavailable");
            }
        });
    }
}