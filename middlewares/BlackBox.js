import { error } from '../templates/error.js'
class BlackBox{
    constructor(){

    }

    static ignite(err, req , res){
        
        res.writeHead(500, {'Content-Type': 'text/html'})
        res.end(error(err.message, err.stack))
    }
}


export default BlackBox;