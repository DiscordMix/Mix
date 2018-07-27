import { Table } from "knex";

export default class KnexTable<Model> {
    public readonly name: string;

    private readonly connection: Table;

    /**
     * @param {Table} connection
     * @param {string} name
     */
    constructor(connection: any, name: string) {
        /**
         * @private
         * @readonly
         */
        this.connection = connection;

        /**
         * @readonly
         */
        this.name = name;
    }

    /**
     * @param {*} query
     * @param {*} value
     * @return {Promise<Array<ModeL>>}
     */
    public async find(query: any, value?: any): Promise<Array<Model>> {
        return (await this.connection(this.name).select().where(query, value).then()) as Array<Model>;
    }

    /**
     * @param {*} query
     * @param {*} value
     * @return {Promise<Model | null>}
     */
    public async findSingle(query: any, value?: any): Promise<Model | null> {
        const result: Array<Model> = (await this.find(query, value)) as Array<Model>;

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
     * @param {Array<Model>} models
     * @return {Promise<void>}
     */
    public async insertMultiple(models: Array<Model>): Promise<void> {
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