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
        if(DB_DRIVER === 'mysql'){
            await this.__connectMysql()
            return;
        }
        throw new Error("Driver no soportado" + DB_DRIVER)
    }



    static async __connectMysql(){

    }

    static async query(sql, params){
        return this.client.query(sql, params);
    }
}


export default Connection;