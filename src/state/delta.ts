import Log from "../core/log";

export type ComparableEntity = object | string | number;

const ComparableEntities: string[] = ["string", "object", "number"];

export default abstract class Delta {
    /**
     * Compare two objects' properties without recursion (top-level properties).
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

    /**
     * Compare two objects' properties using recursion.
     * @param {object} entity1
     * @param {object} entity2
     * @return {*}
     */
    public static deepCompare(entity1: object, entity2: object): any {
        // TODO
        throw Log.notImplemented;
    }

    /**
     * Determine if two entities are different.
     * @param {ComparableEntity} entity1
     * @param {ComparableEntity} entity2
     * @return {boolean} Whether the provided entities are different.
     */
    public static different(entity1: ComparableEntity, entity2: ComparableEntity): boolean {
        if (typeof entity1 !== typeof entity2) {
            throw Log.error("Unable to compare different types");
        }
        else if (!ComparableEntities.includes(typeof entity1)) {
            throw Log.error("Entity type is not comparable");
        }
        else if (typeof entity1 === "string") {
            return entity1 === entity2;
        }
        else if (typeof entity1 === "object") {
            return Object.keys(Delta.compare(entity1, entity2 as object)).length !== 0;
        }
        else {
            throw Log.error("Unable to compare unexpected type of entity");
        }
    }
}
