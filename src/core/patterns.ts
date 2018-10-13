export default abstract class Patterns {
    public static invite: RegExp = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s.]+[a-z]/gmi;

    public static url: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    public static token: RegExp = /^[a-zA-Z0-9]{24}\.[a-zA-Z0-9]{3}\-[a-z]{2}\.[_a-zA-Z0-9-]{27}$/gm;

    public static mention: RegExp = /<@!?[0-9]{18}>/gm;

    public static snowflake: RegExp = /[0-9]{18}/;

    public static mentionOrSnowflake: RegExp = /<@!?[0-9]{18}>|[0-9]{18}/;

    public static state: RegExp = /^(1|true|on|y|yes)$/i;

    /**
     * 1st Group => Long base
     * 2nd Group => Unquoted Value
     * 3rd Group => Quoted Value
     * 4th Group => Short base
     */
    public static commandSwitch: RegExp = /--([a-z]{1,})=?(?:([a-z]+)|"([a-z\s]+)")?|-([a-z]+)/gmi;
}
