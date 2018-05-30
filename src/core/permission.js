import { Permissions as DiscordPermission } from "discord.js"

const Permission = {
    CreateInstantInvite: DiscordPermission.FLAGS.CREATE_INSTANT_INVITE,
    KickMembers: DiscordPermission.FLAGS.KICK_MEMBERS,
    BanMembers: DiscordPermission.FLAGS.BAN_MEMBERS,
    Admin: DiscordPermission.FLAGS.ADMINISTRATOR,
    ManageChannels: DiscordPermission.FLAGS.MANAGE_CHANNELS,
    ManageGuild: DiscordPermission.FLAGS.MANAGE_GUILD,
    AddReactions: DiscordPermission.FLAGS.ADD_REACTIONS,
    ViewAuditLog: DiscordPermission.FLAGS.VIEW_AUDIT_LOG,
    ViewChannel: DiscordPermission.FLAGS.VIEW_CHANNEL,
    SendMessages: DiscordPermission.FLAGS.SEND_MESSAGES,
    SendTTSMessages: DiscordPermission.FLAGS.SEND_TTS_MESSAGES,
    ManageMessages: DiscordPermission.FLAGS.MANAGE_MESSAGES,
    EmbedLinks: DiscordPermission.FLAGS.EMBED_LINKS,
    AttachFiles: DiscordPermission.FLAGS.ATTACH_FILES,
    ReadMessageHistory: DiscordPermission.FLAGS.READ_MESSAGE_HISTORY,
    MentionEveryone: DiscordPermission.FLAGS.MENTION_EVERYONE,
    UseExternalEmojis: DiscordPermission.FLAGS.USE_EXTERNAL_EMOJIS,
    VoiceConnect: DiscordPermission.FLAGS.CONNECT,
    VoiceSpeak: DiscordPermission.FLAGS.SPEAK,
    VoiceMuteMembers: DiscordPermission.FLAGS.MUTE_MEMBERS,
    VoiceDeafenMembers: DiscordPermission.FLAGS.DEAFEN_MEMBERS,
    VoiceMoveMembers: DiscordPermission.FLAGS.MOVE_MEMBERS,
    VoiceUseVAD: DiscordPermission.FLAGS.USE_VAD,
    ChangeNickname: DiscordPermission.FLAGS.CHANGE_NICKNAME,
    ManageNicknames: DiscordPermission.FLAGS.MANAGE_NICKNAMES,
    ManageRoles: DiscordPermission.FLAGS.MANAGE_ROLES,
    ManageWebhooks: DiscordPermission.FLAGS.MANAGE_WEBHOOKS,
    ManageEmojis: DiscordPermission.FLAGS.MANAGE_EMOJIS
};

export default Permission;
