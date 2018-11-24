export type PromiseOr<Type> = Promise<Type> | Type;

export type IProvider<ItemType> = {
    /**
     * Retrieve guild data
     * @abstract
     * @param {string} key
     * @return {PromiseOr<ItemType | null>}
     */
    get(key: string): PromiseOr<ItemType | null>;

    /**
     * Set guild data
     * @abstract
     * @param {string} key
     * @param {ItemType} value
     * @return {PromiseOr<boolean>}
     */
    set(key: string, value: ItemType): PromiseOr<boolean>;

    /**
     * @param {string} key
     * @return {PromiseOr<boolean>}
     */
    has(key: string): PromiseOr<boolean>;
}

export interface IDuplexProvider<ItemType> extends IProvider<ItemType> {
    /**
     * @param {string} key
     * @param {ItemType} value
     * @return {PromiseOr<boolean>}
     */
    update(key: string, value: ItemType): PromiseOr<boolean>;

    /**
     * @param {string} key
     * @return {PromiseOr<boolean>}
     */
    delete(key: string): PromiseOr<boolean>;
}

export interface IQueriableProvider<ItemType> extends IProvider<ItemType> {
    /**
     * @param {Partial<ItemType>} query
     * @return {PromiseOr<ItemType[] | null>}
     */
    find(query: Partial<ItemType>): PromiseOr<ItemType[] | null>;

    /**
     * @param {Partial<ItemType>} query
     * @return {PromiseOr<ItemType | null>}
     */
    findOne(query: Partial<ItemType>): PromiseOr<ItemType | null>;

    /**
     * @param {Partial<ItemType>} query
     * @param {PromiseOr<number>} value
     */
    update(query: Partial<ItemType>, value: ItemType): PromiseOr<number>;

    /**
     * @param {Partial<ItemType>} query
     * @param {ItemType} value
     * @return {PromiseOr<boolean>}
     */
    updateOne(query: Partial<ItemType>, value: ItemType): PromiseOr<boolean>;

    /**
     * @param {Partial<ItemType>} query
     * @return {PromiseOr<number>}
     */
    delete(query: Partial<ItemType>): PromiseOr<number>;

    /**
     * @param {Partial<ItemType>} query
     * @return {PromiseOr<boolean>}
     */
    deleteOne(query: Partial<ItemType>): PromiseOr<boolean>;
}