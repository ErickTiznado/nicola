

const Teleforce = (req, res, next) =>{
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'Deny')
    res.setHeader('X-XSS-Protection', '1')
    next()
}

export default Teleforce;