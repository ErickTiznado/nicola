import { isPromise } from "../utils/isPromise.js";


class Remote {

    constructor() {
        this.stack = []
    }

    __add(method, path, handlers) {
        const results = this.parsePath(path)
        const allHandlers = handlers.flat(Infinity);
        if (allHandlers.length === 1 && allHandlers[0] instanceof Remote) {
            this.stack.push({
                method: method.toUpperCase(),
                path: path,
                handler: allHandlers[0]
            })
            return;
        }

        const runner = (req, res, routerNext) => {
            let idx = 0
            const internalNext = (err) => {
                if (err) return routerNext(err);

                const fn = allHandlers[idx];
                idx++;
                if (!fn) {
                    return routerNext();
                }

                try {
                    let results = fn(req, res, internalNext);

                    if(isPromise(results)){
                       results.catch(internalNext); 
                    }
                }
                catch (error) {
                    internalNext(error);
                }
            }
            internalNext();
        }
        if (results.regex) {
            this.stack.push({
                method: method.toUpperCase(),
                path: path,
                regex: results.regex,
                keys: results.keys,
                handler: runner
            })
        }
        else {
            this.stack.push({
                method: method.toUpperCase(),
                path: results,
                handler: runner
            })
        }
    }

    get(path, ...handlers) {
        this.__add('GET', path, handlers);
    }
    post(path, ...handlers) {
        this.__add('POST', path, handlers);
    }
    put(path, ...handlers) {
        this.__add('PUT', path, handlers);
    }
    patch(path, ...handlers) {
        this.__add('PATCH', path, handlers);
    }
    delete(path, ...handlers) {
        this.__add('DELETE', path, handlers);
    }


    use(path, ...handlers) {
        if (typeof path == 'function') {
            this.__add('USE', '/', [path, ...handlers])
        }
        else {
            this.__add('USE', path, handlers);
        }

    }

    handle(req, res, done) {
        let index = 0
        let match = false
        const next = (err) => {
            if (err) {
                return done(err)
            }

            try {
                const route = this.stack[index]
                index++;
                if (!route) {
                    return done()
                }
                const middleware = route.method === 'USE' && req.url.startsWith(route.path);
                const rutaCoincidence = route.path === req.url && route.method === req.method;
                match = route.regex && route.regex.test(req.url) && route.method === req.method;
                if(match){
                    if(route.regex){
                        const valueCatch =  req.url.match(route.regex)
                        req.params = {}
                        route.keys.forEach((key, index) => {
                            req.params[key]= valueCatch[index + 1];
                        });
                    }
                }
                if (rutaCoincidence || middleware || match) {
                    if (route.handler instanceof Remote) {
                        const urlBackup = req.url;
                        req.url = req.url.slice(route.path.length) || '/'
                        const done = (err) => {
                            req.url = urlBackup
                            next(err)
                        }
                        route.handler.handle(req, res, done);

                    } else {

                        route.handler(req, res, next);
                    }
                }
                else {
                    next()
                }
            } catch (err) {
                next(err);
            }
        }



        next()
    }

    parsePath(path) {
        if (!path.includes(':')) {
            return path;
        }
        if (path.includes(':')) {
            const keys = []
            let pathString = path.replace(/:(\w+)/g, (match, paramName) => {
                keys.push(paramName);

                return '([^/]+)';
            })

            const regex = new RegExp(`^${pathString}$`)
            return { regex, keys };
        }
    }
}

export default Remote;