export default abstract class Pattern {
    public static invite: RegExp = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s.]+[a-z]/gmi;

    public static url: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    public static token: RegExp = /ND[a-z0-9]{22}\.D[a-z]{2}[a-z0-9-]{3}\.[-a-z0-9_]{27}/gmi;

    public static mention: RegExp = /<@!?[0-9]{18}>/gm;

    public static snowflake: RegExp = /[0-9]{18}/gm;

    public static mentionOrSnowflake: RegExp = /<@!?[0-9]{18}>|[0-9]{18}/gm;

    public static anyMention: RegExp = /<(?:\@|\#|\&)[0-9]{18}>|@(?:everyone|here)/gm;

    public static args: RegExp = / (```((?!```).)*```|"[^"]+"|'[^']+'|`[^`]+`|[^ ]+|[^ ]+(;|^))/g;

    public static state: RegExp = /(1|true|on|y|yes)/i;

    /**
     * 1st Group => Long base
     * 2nd Group => Unquoted Value
     * 3rd Group => Quoted Value
     * 4th Group => Short base
     */
    public static commandSwitch: RegExp = /--?([a-z]{1,})=?(?:([^\s"]+)|"([^"]+)")?/gmi;

    public static ipv4: RegExp = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])/gm;

    public static ipv6: RegExp = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%[0-9]+)?/gm;

    /**
     * Matches file names with extension '.js' not starting with '.' or '@'
     */
    public static fragmentFileName: RegExp = /^[^\.@](?:.*?)\.js$/;

    public static typescriptError: RegExp = /^(?<path>[^*]+)\((?<line>[0-9]+),(?<pos>[0-9]+)\): error (?<code>TS[0-9]+):(?<message>[^*]+)$/gm;

    public static tslintWarning: RegExp = /^WARNING: (?<path>[^*]+) - (?<message>[^*]+)$/gm;

    public static fragmentName: RegExp = /^(?:[a-z]{0,}[a-z0-9-_\S]+){2,50}$/i;

    public static fragmentDescription: RegExp = /^(?:[a-z]{0,}[^\n\r\t\0]+){1,100}$/i;
}
