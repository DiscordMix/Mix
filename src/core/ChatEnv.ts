namespace Core {
    /**
     * Different possible environments where command execution can take place.
     */
    export enum ChatEnv {
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
}
