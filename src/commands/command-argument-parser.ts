export default class CommandArgumentParser {
    /**
     * @param {string} type
     * @param {string} arg
     * @param {Object} resolvers
     * @return {*}
     */
    static resolve(type: string, arg: string, resolvers: any): any {
        const keys = Object.keys(resolvers);

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === type) {
                return resolvers[keys[i]](arg);
            }
        }

        throw new Error(`[CommandArgumentParser.resolve] Missing argument resolver: ${type}`);
    }
}
