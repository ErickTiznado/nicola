import { error } from '../templates/error.js'

class BlackBox {
    constructor() {}

    static ignite(err, req, res) {
        const isProd = process.env.NODE_ENV === 'production'

        if (isProd) {
            console.error(err)
        }

        const message = isProd ? 'Internal Server Error' : (err?.message || 'Error')
        const stack = isProd ? null : (err?.stack || null)

        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end(error(message, stack))
    }
}

export default BlackBox;