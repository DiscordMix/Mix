namespace Core {
    /**
     * Possible events dispatched by the Discord.JS client.
     */
    export enum DiscordEvent {
        /**
         * A text message has been sent in a channel.
         */
        Message = "message",

        /**
         * A channel was created in a guild.
         */
        ChannelCreated = "channelCreate",

        /**
         * A channel was deleted from a guild.
         */
        ChannelDeleted = "channelDelete",

        /**
         * The pinned messages of a guild channel have been updated.
         */
        ChannelPinsUpdated = "channelPinsUpdate",

        /**
         * A guild channel's settings have been updated.
         */
        ChannelUpdated = "channelUpdate",

        ClientUserGuildSettingsUpdated = "clientUserGuildSettingsUpdate",
        ClientUserSettingsUpdated = "clientUserSettingsUpdate",

        /**
         * The Discord client disconnected.
         */
        Disconnected = "disconnect",

        /**
         * An emoji was created in a guild.
         */
        EmojiCreated = "emojiCreate",

        /**
         * An emoji was deleted from a guild.
         */
        EmojiDeleted = "emojiDelete",

        /**
         * An emoji was updated in a guild.
         */
        EmojiUpdated = "emojiUpdate",

        /**
         * There was an internal error in the Discord client.
         */
        Error = "error",

        /**
         * A guild issued a new ban to a member.
         */
        GuildBanAdded = "guildBanAdd",

        /**
         * A guild removed an existing ban.
         */
        GuildBanRemoved = "guildBanRemove",

        /**
         * A guild was joined.
         */
        GuildJoined = "guildCreate",

        /**
         * A guild was left.
         */
        GuildLeft = "guildDelete",

        /**
         * A new member joined a guild.
         */
        GuildMemberJoined = "guildMemberAdd",

        GuildMemberAvailable = "guildMemberAvailable",

        /**
         * An existing guild member left a guild.
         */
        GuildMemberLeft = "guildMemberRemove",

        GuildMembersChunk = "guildMembersChunk",

        /**
         * A guild member is currently speaking in a guild voice channel.
         */
        GuildMemberSpeaking = "guildMemberSpeaking",

        /**
         * A guild member's information was updated in a guild.
         */
        GuildMemberUpdated = "guildMemberUpdate",

        /**
         * A guild became unavailable. May be due to outages or Discord limits.
         */
        GuildUnavailable = "guildUnavailable",

        /**
         * A guild's settings were updated.
         */
        GuildUpdated = "guildUpdate",

        /**
         * A sent text message was deleted.
         */
        MessageDeleted = "messageDelete",

        /**
         * Multiple sent messages were deleted at the same time.
         */
        MessagesBulkDeleted = "messageDeletedBulk",

        /**
         * A reaction emoji was added to an existing text message.
         */
        MessageReactionAdded = "messageReactionAdd",

        /**
         * A reaction emoji was removed from an existing text message.
         */
        MessageReactionRemoved = "messageReactionRemove",

        /**
         * All reaction emojis were removed from an existing text message.
         */
        MessageReactionsRemoved = "messageReactionRemoveAll",

        /**
         * An existing text message was updated by it's sender.
         */
        MessageUpdated = "messageUpdate",

        /**
         * A member's presence and information was updated. 
         */
        PresenceUpdated = "presenceUpdate",

        /**
         * The Discord client is being temporarily rate-limited from further requests.
         */
        RateLimit = "rateLimit",

        /**
         * The Discord client has successfully setup and connected.
         */
        Ready = "ready",

        /**
         * The Discord client is attempting to reconnect.
         */
        Reconnecting = "reconnecting",

        /**
         * Connection to Discord has been resumed.
         */
        Resume = "resume",

        /**
         * A role was created in a guild.
         */
        RoleCreated = "roleCreate",

        /**
         * A role was deleted from a guild.
         */
        RoleDeleted = "roleDelete",

        /**
         * An existing role was updated in a guild.
         */
        RoleUpdated = "roleUpdate",

        /**
         * A user has started typing a text message.
         */
        TypingStarted = "typingStart",

        /**
         * A user has stopped typing a text message.
         */
        TypingStopped = "typingStop",

        /**
         * The personal note of an user was updated.
         */
        UserNoteUpdated = "userNoteUpdate",

        /**
         * A user's information was updated.
         */
        UserUpdated = "userUpdate",

        /**
         * A voice state of a member was updated.
         */
        VoiceStateUpdated = "voiceStateUpdate",

        Warn = "warn"
    }
}
