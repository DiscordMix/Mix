import {User, Client, Message, MessageReaction, GuildMember, Guild} from "discord.js";
import {EventEmitter} from "events";

export default class UserObserver extends EventEmitter {
    private readonly client: Client;
    private readonly user: User;

    /**
     * @param {Client} client
     * @param {User} user
     */
    public constructor(client: Client, user: User) {
        super();

        /**
         * @type {Client}
         * @private
         * @readonly
         */
        this.client = client;

        /**
         * @type {User}
         * @private
         * @readonly
         */
        this.user = user;
        
        this.setupEvents();
    }

    private setupEvents(): void {
        // Message
        this.client.on("message", (message: Message) => {
            if (message.author.id === this.user.id) {
                this.emit("message", message);
            }
        });

        // Message Update
        this.client.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
            if (oldMessage.author.id === this.user.id) {
                this.emit("messageUpdate", oldMessage, newMessage);
            }
        });

        // Message Delete
        this.client.on("messageDelete", (message: Message) => {
            if (message.author.id === this.user.id) {
                this.emit("messageDelete", message);
            }
        });

        // Message Reaction Add
        this.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => {
            if (user.id === this.user.id) {
                this.emit("messageReactionAdd", messageReaction, user);
            }
        });

        // Message Reaction Remove
        this.client.on("messageReactionRemove", (messageReaction: MessageReaction, user: User) => {
            if (user.id === this.user.id) {
                this.emit("messageReactionRemove", messageReaction, user);
            }
        });

        // Message Reaction Remove All
        this.client.on("messageReactionRemoveAll", (message: Message) => {
            if (message.author.id === this.user.id) {
                this.emit("messageReactionRemoveAll", message);
            }
        });

        // User Update
        this.client.on("userUpdate", (oldUser: User, newUser: User) => {
            if (oldUser.id === this.user.id) {
                this.emit("userUpdate", oldUser, newUser);
            }
        });

        // Guild Member Update
        this.client.on("guildMemberUpdate", (oldMember: GuildMember, newMember: GuildMember) => {
            if (oldMember.id === this.user.id) {
                this.emit("guildMemberUpdate", oldMember, newMember);
            }
        });

        // Guild Member Add
        this.client.on("guildMemberAdd", (member: GuildMember) => {
            if (member.id === this.user.id) {
                this.emit("guildMemberAdd", member);
            }
        });

        // Guild Member Remove
        this.client.on("guildMemberRemove", (member: GuildMember) => {
            if (member.id === this.user.id) {
                this.emit("guildMemberRemove", member);
            }
        });

        // Guild Ban Add
        this.client.on("guildBanAdd", (guild: Guild, user: User) => {
            if (user.id === this.user.id) {
                this.emit("guildBanAdd", guild, user);
            }
        });

        // Guild Ban Remove
        this.client.on("guildBanRemove", (guild: Guild, user: User) => {
            if (user.id === this.user.id) {
                this.emit("guildBanRemove", guild, user);
            }
        });

        // Guild Member Available
        this.client.on("guildMemberAvailable", (member: GuildMember) => {
            if (member.id === this.user.id) {
                this.emit("guildMemberAvailable", member);
            }
        });

        // TODO: Missing Guild Member Speaking and possibly others
    }
}