import Connection from "./Connection.js";

class QueryBuilder {
  constructor(db_name) {
    this.table = db_name;
    this.columns = ["*"];
    this.conditions = [];
    this.bindings = [];
    this.orders= [];
    this.limitCount= null;
    this.offsetCount = null;
  }

  select(columns) {
    if (Array.isArray(columns)) {
      this.columns = columns;
    }
    if (typeof columns === "string") {
      let columnsSplit = columns.split(",");
      let cleanCols = [];
      for (const col of columnsSplit) {
        cleanCols.push(col.trim());
      }
      this.columns = cleanCols;
    }
    return this;
  }

  where(column, operator, value) {
    if (value === undefined) {
      value = operator;
      operator = "=";
    }

    let totalIndex = this.bindings.length + 1;

    this.conditions.push({
      column: column,
      operator: operator,
      bindingsIndex: totalIndex,
    });

    this.bindings.push(value);

    return this;
  }

  async get() {
    const { sql, bindings } = Connection.client.compileSelect(this);
    const result = await Connection.query(sql, bindings);
    return result.rows;
  }

  async insert(data) {
    const { sql, bindings } = Connection.client.compileInsert(this, data);
    const result = await Connection.query(sql, bindings);
    return result.rows[0];
  }

  async update(data) {
    const { sql, bindings } = Connection.client.compileUpdate(this, data);
    const result = await Connection.query(sql, bindings);
    return result.count;
  }

  async delete() {
    const { sql, bindings } = Connection.client.compileDelete(this);
    const result = await Connection.query(sql, bindings);
    return result.count;
  }

  orderBy(column, direction = "ASC"){
    this.orders.push({
        column: column,
        direction: direction.toUpperCase()
    })

    return this;
  }

  limit(number){
    this.limitCount = number

    return this;
  }

  offset(number){
    this.offsetCount = number

    return this;
  }


}

export default QueryBuilder;
