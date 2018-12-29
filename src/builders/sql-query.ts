import {IBuilder} from "./builder";

// TODO: Move this into it's own thing
export type SqlQueryOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "LIKE" | "IN";

export interface ISqlQueryWhere {
    readonly property: string;
    readonly value: any;
    readonly operator?: SqlQueryOperator;
}

export interface ISqlQueryBuilder<T> extends IBuilder<string> {
    where(query: Partial<T>): this;
    limit(amount: number): this;
    select(properties: string[]): this;
    update(values: Partial<T>): this;
    insert(values: T | Partial<T>): this;
}

export default class SqlQuery<T extends object> implements ISqlQueryBuilder<T> {
    protected readonly table: string;

    protected prefix: string;
    protected suffix?: string;
    protected wheres: ISqlQueryWhere[];
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

        for (let i: number = 0; i < searchKeys.length; i++) {
            this.wheres.push({
                property: searchKeys[i],
                value: query[searchKeys[i]]
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

        for (let i: number = 0; i < valuesKeys.length; i++) {
            setAddition.push(`${valuesKeys[i]} = ${values[valuesKeys[i]]}`);
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

        for (let i: number = 0; i < valuesKeys.length; i++) {
            columns.push(valuesKeys[i]);
            finalValues.push(SqlQuery.getValueQueryForm(values[valuesKeys[i]]));
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

    /**
     * @param value
     * @return {string}
     */
    protected static getValueQueryForm(value: any): string {
        if (typeof(value) === "string") {
            return `"${value}"`;
        }
        else if (typeof(value) === "number") {
            return value.toString();
        }

        return value.toString();
    }
}
