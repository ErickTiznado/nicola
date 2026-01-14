import Postgres from "./dialects/Postgres.js";

class Connection {
    static client = null


    static async connect() {
        const DB_DRIVER = process.env.DB_DRIVER
        if (!DB_DRIVER) {
            throw new Error('Missing DB_DRIVER environment variable')
        }
        let config = {}
        if(process.env.DB_URL){
            const url = new URL(process.env.DB_URL);

            config = {
                user: url.username,
                password: decodeURIComponent(url.password),
                host: url.hostname,
                port: url.port ? Number(url.port) : undefined,
                database: url.pathname.slice(1)
            }
        }
        else{
        config = {
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
                database: process.env.DB_NAME
            }
        }
        if(DB_DRIVER === 'postgres'){
            this.client =  new Postgres(config)
            await this.client.connect()
            return;
        }

        throw new Error("Driver no soportado" + DB_DRIVER)
    }




    static async query(sql, params){
        if(!this.client) throw new Error("No hay conexion activa")
        return this.client.query(sql, params);
    }

    static async disconnect() {
        if (!this.client) return
        if (typeof this.client.disconnect === 'function') {
            await this.client.disconnect()
        }
        this.client = null
    }
}


export default Connection;