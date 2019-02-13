import {Channel, Client, Collection, Message, MessageReaction, TextChannel, User} from "discord.js";
import {EventEmitter} from "events";

export default class ChannelObserver extends EventEmitter {
    protected readonly client: Client;
    protected readonly channel: TextChannel;

    public constructor(client: Client, channel: TextChannel) {
        super();

        this.client = client;
        this.channel = channel;

        // Setup events.
        this.setupListeners();
    }

    protected setupListeners(): void {
        // Message.
        this.client.on("message", (message: Message) => {
            if (message.channel.id === this.channel.id) {
                this.emit("message", message);
            }
        });

        // Message update.
        this.client.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
            if (oldMessage.id === this.channel.id) {
                this.emit("messageUpdate", oldMessage, newMessage);
            }
        });

        // Message delete bulk.
        this.client.on("messageDeleteBulk", (messages: Collection<string, Message>) => {
            if (messages.first().channel.id === this.channel.id) {
                this.emit("messageDeleteBulk", messages);
            }
        });

        // Message delete.
        this.client.on("messageDelete", (message: Message) => {
            if (message.channel.id === this.channel.id) {
                this.emit("messageDelete", message);
            }
        });

        // Channel delete
        this.client.on("channelDelete", (channel: Channel) => {
            if (channel.id === this.channel.id) {
                this.emit("channelDelete", channel);
            }
        });

        // Channel pins update.
        this.client.on("channelPinsUpdate", (channel: Channel, time: Date) => {
            if (channel.id === this.channel.id) {
                this.emit("channelPinsUpdate", channel, time);
            }
        });

        // Channel update.
        this.client.on("channelUpdate", (oldChannel: Channel, newChannel: Channel) => {
            if (oldChannel.id === this.channel.id) {
                this.emit("channelUpdate", oldChannel, newChannel);
            }
        });

        // Message reaction add.
        this.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => {
            if (messageReaction.message.channel.id === this.channel.id) {
                this.emit("messageReactionAdd", messageReaction, user);
            }
        });

        // Message reaction remove.
        this.client.on("messageReactionRemove", (messageReaction: MessageReaction, user: User) => {
            if (messageReaction.message.channel.id === this.channel.id) {
                this.emit("messageReactionRemove", messageReaction, user);
            }
        });

        // Message reaction remove all.
        this.client.on("messageReactionRemoveAll", (message: Message) => {
            if (message.channel.id === this.channel.id) {
                this.emit("nessageReactionRemoveAll", message);
            }
        });

        // Typing start.
        this.client.on("typingStart", (channel: Channel, user: User) => {
            if (channel.id === this.channel.id) {
                this.emit("typingStart", channel, user);
            }
        });

        // Typing stop.
        this.client.on("typingStop", (channel: Channel, user: User) => {
            if (channel.id === this.channel.id) {
                this.emit("typingStop", channel, user);
            }
        });
    }
}
