export type PromiseOr<Type> = Promise<Type> | Type;

export type IProvider<ItemType> = {
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
     * @return {boolean}
     */
    update(key: string, value: ItemType): boolean;

    /**
     * @param {string} key
     * @return {boolean}
     */
    delete(key: string): boolean;
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