import {Client, Guild, GuildMember, Message, MessageReaction, User} from "discord.js";
import {EventEmitter} from "events";

export default class UserObserver extends EventEmitter {
    protected readonly client: Client;
    protected readonly user: User;

    /**
     * @param {Client} client
     * @param {User} user
     */
    public constructor(client: Client, user: User) {
        super();

        this.client = client;
        this.user = user;

        // Setup events.
        this.setupEvents();
    }

    protected setupEvents(): void {
        // Message.
        this.client.on("message", (message: Message) => {
            if (message.author.id === this.user.id) {
                this.emit("message", message);
            }
        });

        // Message update.
        this.client.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
            if (oldMessage.author.id === this.user.id) {
                this.emit("messageUpdate", oldMessage, newMessage);
            }
        });

        // Message delete.
        this.client.on("messageDelete", (message: Message) => {
            if (message.author.id === this.user.id) {
                this.emit("messageDelete", message);
            }
        });

        // Message reaction add.
        this.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => {
            if (user.id === this.user.id) {
                this.emit("messageReactionAdd", messageReaction, user);
            }
        });

        // Message reaction remove.
        this.client.on("messageReactionRemove", (messageReaction: MessageReaction, user: User) => {
            if (user.id === this.user.id) {
                this.emit("messageReactionRemove", messageReaction, user);
            }
        });

        // Message reaction remove All.
        this.client.on("messageReactionRemoveAll", (message: Message) => {
            if (message.author.id === this.user.id) {
                this.emit("messageReactionRemoveAll", message);
            }
        });

        // User update.
        this.client.on("userUpdate", (oldUser: User, newUser: User) => {
            if (oldUser.id === this.user.id) {
                this.emit("userUpdate", oldUser, newUser);
            }
        });

        // Guild member update.
        this.client.on("guildMemberUpdate", (oldMember: GuildMember, newMember: GuildMember) => {
            if (oldMember.id === this.user.id) {
                this.emit("guildMemberUpdate", oldMember, newMember);
            }
        });

        // Guild member add.
        this.client.on("guildMemberAdd", (member: GuildMember) => {
            if (member.id === this.user.id) {
                this.emit("guildMemberAdd", member);
            }
        });

        // Guild member remove.
        this.client.on("guildMemberRemove", (member: GuildMember) => {
            if (member.id === this.user.id) {
                this.emit("guildMemberRemove", member);
            }
        });

        // Guild ban add.
        this.client.on("guildBanAdd", (guild: Guild, user: User) => {
            if (user.id === this.user.id) {
                this.emit("guildBanAdd", guild, user);
            }
        });

        // Guild ban remove.
        this.client.on("guildBanRemove", (guild: Guild, user: User) => {
            if (user.id === this.user.id) {
                this.emit("guildBanRemove", guild, user);
            }
        });

        // Guild member available.
        this.client.on("guildMemberAvailable", (member: GuildMember) => {
            if (member.id === this.user.id) {
                this.emit("guildMemberAvailable", member);
            }
        });

        // TODO: Missing Guild Member Speaking and possibly others.
    }
}
