/**
 * Different possible environments where
 * command execution can take place.
 */
enum ChatEnv {
    /**
     * Represents DMs only.
     */
    Private,

    /**
     * Represents anywhere in a guild.
     */
    Guild,

    /**
     * Represents any environment.
     */
    Anywhere,

    /**
     * Represents NSFW guild text channel(s).
     */
    NSFW
}

export default ChatEnv;
