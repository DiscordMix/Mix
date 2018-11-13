import {Table} from "knex";

export default class KnexTable<Model> {
    public readonly name: string;

    private readonly connection: Table;

    /**
     * @param {Table} connection
     * @param {string} name
     */
    public constructor(connection: any, name: string) {
        /**
         * @type {Table}
         * @private
         * @readonly
         */
        this.connection = connection;

        /**
         * @type {string}
         * @readonly
         */
        this.name = name;
    }

    /**
     * @param {*} query
     * @param {*} value
     * @return {Promise<Model[]>}
     */
    public async find(query: any, value?: any): Promise<Model[]> {
        return (await this.connection(this.name).select().where(query, value).then()) as Model[];
    }

    /**
     * @param {*} query
     * @param {*} value
     * @return {Promise<Model | null>}
     */
    public async findSingle(query: any, value?: any): Promise<Model | null> {
        const result: Model[] = (await this.find(query, value)) as Model[];

        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * @param {Model} model
     * @return {Promise<void>}
     */
    public async insert(model: Model): Promise<void> {
        await this.connection(this.name).insert(model).then();
    }

    /**
     * @param {Model[]} models
     * @return {Promise<void>}
     */
    public async insertMultiple(models: Model[]): Promise<void> {
        for (let i: number = 0; i < models.length; i++) {
            await this.insert(models[i]);
        }
    }

    /**
     * @todo Single-value query support
     * @param {*} query
     * @param {*} changes
     * @return {Promise<void>}
     */
    public async update(query: any, changes: any): Promise<void> {
        await this.connection(this.name).where(query).update(changes).then();
    }

    /**
     * @param {*} query
     * @return {Promise<void>}
     */
    public async remove(query: any): Promise<void> {
        await this.connection(this.name).where(query).delete().then();
    }
}
