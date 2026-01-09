import { green } from "../utils/console.js";
const Shadowgraph = (req, res, next) =>{
    const inicio = Date.now()
    res.on('finish', () =>{
        const duracion = Date.now() - inicio 
        console.log(green(`[${req.method}] ${req.url} - ${res.statusCode} ${res.statusMessage} - ${duracion}ms`))
    })
    next()
}


export default Shadowgraph;