export default abstract class Patterns {
    public static invite: RegExp = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s.]+[a-z]/gmi;

    public static url: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    public static token: RegExp = /^[a-zA-Z0-9]{24}\.[a-zA-Z0-9]{3}\-[a-z]{2}\.[_a-zA-Z0-9-]{27}$/gm;

    public static mention: RegExp = /<@[0-9]+>/gm;
}
