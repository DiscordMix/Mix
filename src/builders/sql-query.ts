import {IBuilder} from "./builder";

// TODO: Move this into it's own thing
export type SqlOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "LIKE" | "IN";

export interface ISqlWhere {
    readonly property: string;
    readonly value: any;
    readonly operator?: SqlOperator;
}

export interface ISqlQueryBuilder<T = any> extends IBuilder<string> {
    where(query: Partial<T>): this;
    limit(amount: number): this;
    select(properties: string[]): this;
    update(values: Partial<T>): this;
    insert(values: T | Partial<T>): this;
}

export default class SqlQuery<T = any> implements ISqlQueryBuilder<T> {
    /**
     * @param value
     * @return {string}
     */
    protected static getValueQueryForm(value: any): string {
        if (typeof (value) === "string") {
            return `"${value}"`;
        }
        else if (typeof (value) === "number") {
            return value.toString();
        }

        return value.toString();
    }

    protected readonly table: string;

    protected prefix: string;
    protected suffix?: string;
    protected wheres: ISqlWhere[];
    protected limitAmount?: number;

    /**
     * @param {string} table
     */
    public constructor(table: string) {
        this.table = table;
        this.prefix = "SELECT * FROM ";
        this.wheres = [];
    }

    /**
     * @param {Partial<T>} query
     * @return {SqlQuery}
     */
    public where(query: Partial<T>): this {
        const searchKeys: string[] = Object.keys(query);

        for (const key of searchKeys) {
            this.wheres.push({
                property: key,
                value: query[key]
            });
        }

        return this;
    }

    /**
     * @param {number} amount
     * @return {SqlQuery}
     */
    public limit(amount: number = 1): this {
        this.limitAmount = amount;

        return this;
    }

    /**
     * @param {string[]} properties
     * @return {SqlQuery}
     */
    public select(properties: string[]): this {
        this.prefix = `SELECT (${properties.join(",")})`;

        return this;
    }

    /**
     * @param values
     * @return {SqlQuery}
     */
    public update(values: Partial<T>): this {
        const valuesKeys: string[] = Object.keys(values);
        const setAddition: string[] = [];

        for (const key of valuesKeys) {
            setAddition.push(`${key} = ${values[key]}`);
        }

        this.prefix = "UPDATE ";
        this.suffix = ` SET (${setAddition.join(", ")})`;

        return this;
    }

    /**
     * @param values
     * @return {SqlQuery}
     */
    public insert(values: T | Partial<T>): this {
        const valuesKeys: string[] = Object.keys(values);
        const columns: string[] = [];
        const finalValues: string[] = [];

        for (const key of valuesKeys) {
            columns.push(key);
            finalValues.push(SqlQuery.getValueQueryForm(values[key]));
        }

        this.prefix = "INSERT INTO ";
        this.suffix = ` (${columns.join(", ")}) VALUES (${finalValues.join(", ")})`;

        return this;
    }

    /**
     * @return {string}
     */
    public build(): string {
        let query = `${this.prefix}${this.table}${this.suffix || ""}`;

        if (this.wheres.length > 0) {
            query += " WHERE ";

            const whereAddition: string[] = [];

            for (let i: number = 0; i < this.wheres.length; i++) {
                whereAddition.push(`${this.wheres[i].property} ${this.wheres[i].operator || "="} ${SqlQuery.getValueQueryForm(this.wheres[i].value)}`);
            }

            query += whereAddition.join(", ");
        }

        if (this.limitAmount) {
            query += ` LIMIT ${this.limitAmount}`;
        }

        return `${query};`;
    }
}
