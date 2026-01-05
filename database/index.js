import Model from './Model.js'
import QueryBuilder from './QueryBuilder.js'
import Connection from './Connection.js'

class Dynamo{
    static async connect(){
        return Connection.connect()
    }

    static async query(sql, params){
        return Connection.query(sql, params)
    }


    static Model = Model;
    static QueryBuilder = QueryBuilder;
}


export default Dynamo;