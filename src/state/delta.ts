export abstract class Delta {
    /**
     * Compare two objects's properties without recursion
     * @param entity1
     * @param entity2
     * @return {string[]} The changes
     */
    public static compare(entity1: object, entity2: object): string[] {
        const deltas: string[] = [];
        const keys: string[] = Object.keys(entity1);
        const keys2: string[] = Object.keys(entity2);

        for (let i: number = 0; i < keys2.length; i++) {
            if (!keys.includes(keys2[i])) {
                keys.push(keys2[i]);
            }
        }

        for (let i: number = 0; i < keys.length; i++) {
            const key: string = keys[i];

            if (!entity2.hasOwnProperty(key) || entity2[key] !== entity1[key]) {
                deltas.push(key);
            }
        }

        return deltas;
    }
}