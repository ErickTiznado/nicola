import QueryBuilder from "./QueryBuilder.js";
import Schema from "./Schema.js";

class Model {
    static tableName = null
    static schema = {}
    static query(){
        return new QueryBuilder(this.tableName)
    }

    static select(...params){
        return this.query().select(...params);
    }

    static where(...params){
        return this.query().where(...params);
    }

    static all(){
        return this.query().get();
    }

    static create(...params){
        Schema.validate(...params, this.schema)
        return this.query().insert(...params);
    }

    static update(...params){
        return this.query().update(...params);
    }

    static delete(){
        return this.query().delete();
    }

    static orderBy(...params){
        return this.query().orderBy(...params);
    }
        static limit(...params){
        return this.query().limit(...params);
    }
        static offset(...params){
        return this.query().offset(...params);
    }
}


export default Model;