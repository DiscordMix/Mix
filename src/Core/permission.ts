import {Permissions as DiscordPermission} from "discord.js";

/**
 * Abstraction of possible Discord permissions.
 */
const Permission = {
    CreateInstantInvite: {
        name: "Create Instant Invites",
        permission: DiscordPermission.FLAGS.CREATE_INSTANT_INVITE
    },

    KickMembers: {
        name: "Kick Members",
        permission: DiscordPermission.FLAGS.KICK_MEMBERS
    },

    BanMembers: {
        name: "Ban Members",
        permission: DiscordPermission.FLAGS.BAN_MEMBERS
    },

    Admin: {
        name: "Administrator",
        permission: DiscordPermission.FLAGS.ADMINISTRATOR
    },

    ManageChannels: {
        name: "Manage Channels",
        permission: DiscordPermission.FLAGS.MANAGE_CHANNELS
    },

    ManageGuild: {
        name: "Manage Guild",
        permission: DiscordPermission.FLAGS.MANAGE_GUILD
    },

    AddReactions: {
        name: "Add Reactions",
        permission: DiscordPermission.FLAGS.ADD_REACTIONS
    },

    ViewAuditLog: {
        name: "View Audit Log",
        permission: DiscordPermission.FLAGS.VIEW_AUDIT_LOG
    },

    ViewChannel: {
        name: "View Channel",
        permission: DiscordPermission.FLAGS.VIEW_CHANNEL
    },

    SendMessages: {
        name: "Send Messages",
        permission: DiscordPermission.FLAGS.SEND_MESSAGES
    },

    SendTTSMessages: {
        name: "Send TTS Messages",
        permission: DiscordPermission.FLAGS.SEND_TTS_MESSAGES
    },

    ManageMessages: {
        name: "Manage Messages",
        permission: DiscordPermission.FLAGS.MANAGE_MESSAGES
    },

    EmbedLinks: {
        name: "Embed Links",
        permission: DiscordPermission.FLAGS.EMBED_LINKS
    },

    AttachFiles: {
        name: "Attach Files",
        permission: DiscordPermission.FLAGS.ATTACH_FILES
    },

    ReadMessageHistory: {
        name: "Read Message History",
        permission: DiscordPermission.FLAGS.READ_MESSAGE_HISTORY
    },

    MentionEveryone: {
        name: "Mention Everyone",
        permission: DiscordPermission.FLAGS.MENTION_EVERYONE
    },

    UseExternalEmojis: {
        name: "Use External Emojis",
        permission: DiscordPermission.FLAGS.USE_EXTERNAL_EMOJIS
    },

    VoiceConnect: {
        name: "Voice Connect",
        permission: DiscordPermission.FLAGS.CONNECT
    },

    VoiceSpeak: {
        name: "Voice Speak",
        permission: DiscordPermission.FLAGS.SPEAK
    },

    VoiceMuteMembers: {
        name: "Voice Mute Members",
        permission: DiscordPermission.FLAGS.MUTE_MEMBERS
    },

    VoiceDeafenMembers: {
        name: "Voice Deafen Members",
        permission: DiscordPermission.FLAGS.DEAFEN_MEMBERS
    },

    VoiceMoveMembers: {
        name: "Voice Move Members",
        permission: DiscordPermission.FLAGS.MOVE_MEMBERS
    },

    VoiceUseVAD: {
        name: "Voice Use VAD",
        permission: DiscordPermission.FLAGS.USE_VAD
    },

    ChangeNickname: {
        name: "Change Nickname",
        permission: DiscordPermission.FLAGS.CHANGE_NICKNAME
    },

    ManageNicknames: {
        name: "Manage Nicknames",
        permission: DiscordPermission.FLAGS.MANAGE_NICKNAMES
    },

    ManageRoles: {
        name: "Manage Roles",
        permission: DiscordPermission.FLAGS.MANAGE_ROLES
    },

    ManageWebhooks: {
        name: "Manage Webhooks",
        permission: DiscordPermission.FLAGS.MANAGE_WEBHOOKS
    },

    ManageEmojis: {
        name: "Manage Emojis",
        permission: DiscordPermission.FLAGS.MANAGE_EMOJIS
    }
};

export default Permission;
