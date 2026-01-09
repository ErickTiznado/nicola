import Driver from "../Driver.js";


class Postgres extends Driver {
    constructor(config) {
        super(config);
        this.client = null
    }

    async connect() {
        try {
            const pg = await import('pg')
            const { Pool } = pg.default || pg

            const config = {
                user: this.config.user,
                password: this.config.password,
                host: this.config.host,
                port: this.config.port,
                database: this.config.database
            }

            if (process.env.DB_SSLMODE) {
                const sslMode = process.env.DB_SSLMODE.toLowerCase();

                if (sslMode === 'require') {
                    config.ssl = { rejectUnauthorized: false };
                } else if (sslMode === 'verify-ca' || sslMode === 'verify-full') {
                    config.ssl = { rejectUnauthorized: true };
                } else if (sslMode === 'disable' || sslMode === 'prefer') {
                    config.ssl = false;
                } else {
                    config.ssl = { rejectUnauthorized: false };
                }
            }

            this.client = new Pool(config)

            await this.client.query('SELECT NOW()')
        }
        catch (e) {
            if (e.code === 'ERR_MODULE_NOT_FOUND') {
                throw new Error('Por favor utiliza el comando npm install pg')
            }
            else {
                throw new Error(e.message)
            }
        }
    }


    async query(sql, params) {
        if (!this.client) {
            throw new Error("Database not connected")
        }
        try{
        const result = await this.client.query(sql, params);
        return {
            rows: result.rows,
            count: result.rowCount
        }
    }
    catch(err){
        throw new Error(`Database Query Failed:${err.code}: ${err.message}`)
    }
    }

    compileSelect(builder) {
        const stringColums = builder.columns.join(', ')
        let ordersBy = ''  
        let limit = ''
        let offset = ''
        if(builder.orders.length > 0){
            const OrdesArray = builder.orders.map(o => {
                return ` ${o.column} ${o.direction}`
            })
            ordersBy =' ORDER BY ' + OrdesArray.join(',')

        }
        if(builder.limitCount !== null){
            limit = ` LIMIT ${builder.limitCount}`
        }
        if(builder.offsetCount !== null){
            offset = ` OFFSET ${builder.offsetCount}`
        }
        const where = this._buildWhere(builder.conditions)
        const sql = `SELECT ${stringColums} FROM ${builder.table} ${where} ${ordersBy} ${limit}  ${offset}`

        return {
            sql: sql,
            bindings: builder.bindings
        }
    }

    _buildWhere(conditions) {
        let whereQuery = ''

        if (conditions.length > 0) {
            const query = conditions.map(condition => {
                return ` ${condition.column} ${condition.operator} $${condition.bindingsIndex}`
            })

            return whereQuery = 'WHERE ' + query.join(' AND ')
        }

        return whereQuery
    }


    compileInsert(builder, data) {
        let columns = Object.keys(data);
        columns = columns.join(', ')
        let values = Object.values(data)
        let bindingsIndex = []
        values.forEach(v => {
            let index = builder.bindings.length + 1
            bindingsIndex.push(`$${index}`)
            builder.bindings.push(v)
        })

        bindingsIndex = bindingsIndex.join(', ')

        let sql = `INSERT INTO ${builder.table} (${columns}) VALUES (${bindingsIndex}) RETURNING *`

        return {
            sql: sql,
            bindings: builder.bindings
        }
    }

    compileUpdate(builder, data) {
        const columns = Object.keys(data)
        const values = Object.values(data)
        let stringColums = []
        let whereQuery = ''
        let index = 0
        columns.forEach((c, i) => {
            index = builder.bindings.length + 1
            builder.bindings.push(values[i])
            stringColums.push(`${c} = $${index}`)
        })

        const where = this._buildWhere(builder.conditions)

        stringColums = stringColums.join(', ')

        const sql = `UPDATE ${builder.table} SET ${stringColums} ${where}`

        return {
            sql:sql,
            bindings: builder.bindings
        }
    }

    compileDelete(builder) {
        const where = this._buildWhere(builder.conditions)

        const sql = `DELETE FROM ${builder.table} ${where}`
        
        return{
            sql:sql,
            bindings: builder.bindings
        }
    }
}

export default Postgres;