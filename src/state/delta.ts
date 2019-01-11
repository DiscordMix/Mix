export default abstract class Delta {
    /**
     * Compare two objects's properties without recursion
     * @param {object} entity1
     * @param {object} entity2
     * @return {string[]} The changes
     */
    public static compare(entity1: object, entity2: object): string[] {
        const deltas: string[] = [];
        const keys: string[] = Object.keys(entity1);
        const keys2: string[] = Object.keys(entity2);

        for (const key2 of keys2) {
            if (!keys.includes(key2)) {
                keys.push(key2);
            }
        }

        for (const key of keys) {
            if (!entity2.hasOwnProperty(key) || entity2[key] !== entity1[key]) {
                deltas.push(key);
            }
        }

        return deltas;
    }
}
