import {TextChannel, Client, Message, Channel, Collection} from "discord.js";
import {EventEmitter} from "events";

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
    }
}