import Postgres from "./dialects/Postgres.js";

class Connection {
    static client = null


    static async connect() {
        const DB_DRIVER =  process.env.DB_DRIVER
        const config = {
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME
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
}


export default Connection;