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
}

export interface IDuplexProvider<ItemType> extends IProvider<ItemType> {
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

export interface IQueriableProvider<ItemType> extends IProvider<ItemType> {
    /**
     * @param {Partial<ItemType>} query
     * @return {ItemType[] | null}
     */
    find(query: Partial<ItemType>): PromiseOr<ItemType[] | null>;

    /**
     * @param {Partial<ItemType>} query
     * @return {ItemType | null}
     */
    findOne(query: Partial<ItemType>): PromiseOr<ItemType | null>;

    /**
     * @param {Partial<ItemType>} query
     * @param {number} value
     */
    update(query: Partial<ItemType>, value: ItemType): PromiseOr<number>;

    /**
     * @param {Partial<ItemType>} query
     * @param {ItemType} value
     * @return {boolean}
     */
    updateOne(query: Partial<ItemType>, value: ItemType): PromiseOr<boolean>;

    /**
     * @param {Partial<ItemType>} query
     * @return {number}
     */
    delete(query: Partial<ItemType>): PromiseOr<number>;

    /**
     * @param {Partial<ItemType>} query
     * @return {boolean}
     */
    deleteOne(query: Partial<ItemType>): PromiseOr<boolean>;
}