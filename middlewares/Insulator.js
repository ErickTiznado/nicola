
const Insulator = (schema) => {

    return (req, res, next) => {
        for (const key in schema) {
            const expectedType = schema[key];
            const value = req.body[key]
            if (value === undefined) {
                res.statusCode = 400;
                res.end(`Falta campo: ${key}`)
                return;
            }
            if (typeof value !== expectedType) {
                res.statusCode = 400;
                res.end(`El campo ${key} debe ser ${expectedType}`)
                return;
            }
        }
        next()
    }
}


export default Insulator;