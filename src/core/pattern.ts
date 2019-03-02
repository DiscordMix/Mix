namespace Core {
    /**
     * Collection of useful regular expression patterns used throught the project.
     */
    export abstract class Pattern {
        /**
         * Matches Discord guild invite links.
         */
        public static invite: RegExp = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s.]+[a-z]/gmi;

        /**
         * Matches web URLs.
         */
        public static url: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

        /**
         * Matches Discord bot tokens.
         */
        public static token: RegExp = /[a-z0-9]{24}\.D[a-z]{2}[a-z0-9-]{3}\.[-a-z0-9_]{27}/gmi;

        /**
         * Matches Discord user mention strings.
         */
        public static mention: RegExp = /<@!?[0-9]{18}>/gm;

        /**
         * Matches a Discord user ID or Twitter Snowflake.
         */
        public static snowflake: RegExp = /[0-9]{18}/gm;

        /**
         * Matches either Discord user mentions or Snowflakes.
         */
        public static mentionOrSnowflake: RegExp = /<@!?[0-9]{18}>|[0-9]{18}/gm;

        /**
         * Matches all possible Discord mentions, including '@everyone' and '@here'.
         */
        public static anyMention: RegExp = /<(?:\@|\#|\&)[0-9]{18}>|@(?:everyone|here)/gm;

        /**
         * Matches arguments. Skips the first match (base).
         */
        public static args: RegExp = / (```((?!```).)*```|"[^"]+"|'[^']+'|`[^`]+`|[^ ]+|[^ ]+(;|^))/g;

        /**
         * Matches the string representation of the 'true' state.
         */
        public static positiveState: RegExp = /(1|true|on|y|yes)/i;

        /**
         * Matches the string representation of the 'false' state.
         */
        public static negativeState: RegExp = /(0|false|off|n|no)/i;

        /**
         * Matches argument flags.
         */
        public static flag: RegExp = /--?(?<long_base>[a-z]{1,})=?(?:(?<unquoted_val>[^\s"]+)|"(?<short_base>[^"]+)")?/gmi;

        /**
         * Matches network Ipv4 addresses.
         */
        public static ipv4: RegExp = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])/gm;

        /**
         * Matches network Ipv6 addresses.
         */
        public static ipv6: RegExp = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%[0-9]+)?/gm;

        /**
         * Matches file names with extension '.js' not starting with '.' or '@'
         */
        public static fragmentFileName: RegExp = /^[^\.@](?:.*?)\.js$/;

        /**
         * Matches error messages emitted by the TypeScript compiler.
         */
        public static typescriptError: RegExp = /^(?<path>[^*]+)\((?<line>[0-9]+),(?<pos>[0-9]+)\): error (?<code>TS[0-9]+):(?<message>[^*]+)$/gm;

        /**
         * Matches warning messages emitted by the TSLint linter.
         */
        public static tslintWarning: RegExp = /^WARNING: (?<path>[^*]+):(?<line>[0-9]+):(?<pos>[0-9]+) - (?<message>[^*]+)$/gm;

        /**
         * Matches valid fragment names.
         */
        public static fragmentName: RegExp = /^(?:[a-z]{0,}[a-z0-9-_\S]+){2,50}$/i;

        /**
         * Matches valid fragment descriptions.
         */
        public static fragmentDescription: RegExp = /^(?:[a-z]{0,}[^\n\r\t\0]+){1,100}$/i;

        /**
         * Matches a time string representation.
         */
        public static time: RegExp = /^([0-9]+)(ms|h|d|s|m|mo|y|w|ns)$/;

        /**
         * Matches a date string in the format of dd/mm/yyyy.
         */
        public static date: RegExp = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    }
}
