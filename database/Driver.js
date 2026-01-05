class Driver {


    constructor(config){
        this.config = config
    }

    async connect(){
        throw new Error("Method 'connect()' must be implemented");
    }

    async query(sql, params){
        throw new Error("Method 'query()' must be implemented");
    }

    async disconnect(){
throw new Error("Method 'disconnect()' must be implemented");
    }

     compileSelect(builder){
        
    }

    compileInsert(builder, data){

    }

    compileUpdate(builder, data){

    }

    compileDelete(builder){
        
    }
}


export default Driver;