export type SqlQueryWhereOperatorV2 = "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "LIKE" | "IN";

export interface SqlQueryWhere {
    readonly property: string;
    readonly value: any;
    readonly operator?: SqlQueryWhereOperatorV2;
}

export default class SqlQuery {
    private readonly table: string;

    private prefix: string;
    private suffix?: string;
    private wheres: Array<SqlQueryWhere>;
    private limitAmount?: number;

    constructor(table: string) {
        this.table = table;
        this.prefix = "SELECT * FROM ";
        this.wheres = [];
    }

    where(search: any): SqlQuery {
        const searchKeys: Array<string> = Object.keys(search);

        for (let i: number = 0; i < searchKeys.length; i++) {
            this.wheres.push({
                property: searchKeys[i],
                value: search[searchKeys[i]]
            });
        }

        return this;
    }

    limit(amount: number): SqlQuery {
        this.limitAmount = amount;

        return this;
    }

    select(properties: Array<string>): SqlQuery {
        this.prefix = `SELECT (${properties.join(",")})`;

        return this;
    }

    update(values: any): SqlQuery {
        const valuesKeys: Array<string> = Object.keys(values);
        const setAddition: Array<string> = [];

        for (let i: number = 0; i < valuesKeys.length; i++) {
            setAddition.push(`${valuesKeys[i]} = ${values[valuesKeys[i]]}`);
        }

        this.prefix = "UPDATE ";
        this.suffix = ` SET (${setAddition.join(", ")})`;

        return this;
    }

    insert(values: any): SqlQuery {
        const valuesKeys: Array<string> = Object.keys(values);
        const columns: Array<string> = [];
        const finalValues: Array<string> = [];

        for (let i: number = 0; i < valuesKeys.length; i++) {
            columns.push(valuesKeys[i]);
            finalValues.push(SqlQuery.getValueQueryForm(values[valuesKeys[i]]));
        }

        this.prefix = "INSERT INTO ";
        this.suffix = ` (${columns.join(", ")}) VALUES (${finalValues.join(", ")})`;

        return this;
    }

    build(): string {
        let query = `${this.prefix}${this.table}${this.suffix || ""}`;

        if (this.wheres.length > 0) {
            query += " WHERE ";

            const whereAddition: Array<string> = [];

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
