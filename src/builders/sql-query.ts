export type ISqlQueryOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "LIKE" | "IN";

export type ISqlQueryWhere = {
    readonly property: string;
    readonly value: any;
    readonly operator?: ISqlQueryOperator;
}

export default class SqlQuery {
    private readonly table: string;

    private prefix: string;
    private suffix?: string;
    private wheres: ISqlQueryWhere[];
    private limitAmount?: number;

    /**
     * @param {string} table
     */
    constructor(table: string) {
        this.table = table;
        this.prefix = "SELECT * FROM ";
        this.wheres = [];
    }

    /**
     * @param search
     * @return {SqlQuery}
     */
    public where(search: any): SqlQuery {
        const searchKeys: string[] = Object.keys(search);

        for (let i: number = 0; i < searchKeys.length; i++) {
            this.wheres.push({
                property: searchKeys[i],
                value: search[searchKeys[i]]
            });
        }

        return this;
    }

    /**
     * @param {number} amount
     * @return {SqlQuery}
     */
    public limit(amount: number): SqlQuery {
        this.limitAmount = amount;

        return this;
    }

    /**
     * @param {string[]} properties
     * @return {SqlQuery}
     */
    public select(properties: string[]): SqlQuery {
        this.prefix = `SELECT (${properties.join(",")})`;

        return this;
    }

    /**
     * @param values
     * @return {SqlQuery}
     */
    public update(values: any): SqlQuery {
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
    public insert(values: any): SqlQuery {
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
    private static getValueQueryForm(value: any): string {
        if (typeof(value) === "string") {
            return `"${value}"`;
        }
        else if (typeof(value) === "number") {
            return value.toString();
        }

        return value.toString();
    }
}
