type PromiseOr<Type> = Promise<Type> | Type;

export type Provider<ItemType> = {
    /**
     * Retrieve guild data
     * @abstract
     * @param {string} key
     * @return {ItemType | null}
     */
    get(key: string): ItemType | null;

    /**
     * Set guild data
     * @abstract
     * @param {string} key
     * @param {ItemType} value
     * @return {boolean}
     */
    set(key: string, value: ItemType): boolean;
}

export interface DuplexProvider<ItemType> extends Provider<ItemType> {
    /**
     * @param {string} key
     * @param {ItemType} value
     */
    update(key: string, value: ItemType): boolean;

    /**
     * @param {string} key
     * @return {boolean}
     */
    delete(key: string): boolean;
}

export interface QueriableProvider<ItemType> extends Provider<ItemType> {
    /**
     * @param {*} query
     * @return {ItemType[] | null}
     */
    find(query: any): PromiseOr<ItemType[] | null>;

    /**
     * @param {*} query
     * @return {ItemType | null}
     */
    findOne(query: any): PromiseOr<ItemType | null>;

    /**
     * @param {*} query
     * @param {number} value
     */
    update(query: any, value: ItemType): PromiseOr<number>;

    /**
     * @param {*} query
     * @param {ItemType} value
     * @return {boolean}
     */
    updateOne(query: any, value: ItemType): PromiseOr<boolean>;

    /**
     * @param {*} query
     * @return {number}
     */
    delete(query: any): PromiseOr<number>;

    /**
     * @param {*} query
     * @return {boolean}
     */
    deleteOne(query: any): PromiseOr<boolean>;
}