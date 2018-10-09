import {TextChannel, Client, Message, Channel, Collection, MessageReaction, User} from "discord.js";
import {EventEmitter} from "events";
import {message} from "../decorators/decorators";

export default class ChannelObserver extends EventEmitter {
    private readonly client: Client;
    private readonly channel: TextChannel;

    public constructor(client: Client, channel: TextChannel) {
        super();

        this.client = client;
        this.channel = channel;
        this.setupListeners();
    }

    private setupListeners(): void {
        // Message
        this.client.on("message", (message: Message) => {
            if (message.channel.id === this.channel.id) {
                this.emit("message", message);
            }
        });

        // Message Update
        this.client.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
            if (oldMessage.id === this.channel.id) {
                this.emit("messageUpdate", oldMessage, newMessage);
            }
        });

        // Message Delete Bulk
        this.client.on("messageDeleteBulk", (messages: Collection<string, Message>) => {
            if (messages.first().channel.id === this.channel.id) {
                this.emit("messageDeleteBulk", messages);
            }
        });

        // Message Delete
        this.client.on("messageDelete", (message: Message) => {
            if (message.channel.id === this.channel.id) {
                this.emit("messageDelete", message);
            }
        });

        // Channel Delete
        this.client.on("channelDelete", (channel: Channel) => {
            if (channel.id === this.channel.id) {
                this.emit("channelDelete", channel);
            }
        });

        // Channel Pins Update
        this.client.on("channelPinsUpdate", (channel: Channel, time: Date) => {
            if (channel.id === this.channel.id) {
                this.emit("channelPinsUpdate", channel, time);
            }
        });

        // Channel Update
        this.client.on("channelUpdate", (oldChannel: Channel, newChannel: Channel) => {
            if (oldChannel.id === this.channel.id) {
                this.emit("channelUpdate", oldChannel, newChannel);
            }
        });

        // Message Reaction Add
        this.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => {
            if (messageReaction.message.channel.id === this.channel.id) {
                this.emit("messageReactionAdd", messageReaction, user);
            }
        });

        // Message Reaction Remove
        this.client.on("messageReactionRemove", (messageReaction: MessageReaction, user: User) => {
            if (messageReaction.message.channel.id === this.channel.id) {
                this.emit("messageReactionRemove", messageReaction, user);
            }
        });

        // Message Reaction Remove All
        this.client.on("messageReactionRemoveAll", (message: Message) => {
            if (message.channel.id === this.channel.id) {
                this.emit("nessageReactionRemoveAll", message);
            }
        });

        // Typing Start
        this.client.on("typingStart", (channel: Channel, user: User) => {
            if (channel.id === this.channel.id) {
                this.emit("typingStart", channel, user);
            }
        });

        // Typing Stop
        this.client.on("typingStop", (channel: Channel, user: User) => {
            if (channel.id === this.channel.id) {
                this.emit("typingStop", channel, user);
            }
        });
    }
}