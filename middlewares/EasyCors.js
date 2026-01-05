

const EasyCors = (req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if(req.method === 'OPTIONS'){
        res.statusCode = 204
        res.end()
        return;
    }
    else{
        next()
    }
}


export default EasyCors;