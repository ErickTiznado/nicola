import http from 'http'
import Remote from './Remote.js';
import BlackBox from '../middlewares/BlackBox.js'
import Shadowgraph from '../middlewares/Shadowgraph.js';
import Teleforce from '../middlewares/Teleforce.js';
import EasyCors from '../middlewares/EasyCors.js';
class Core extends Remote {

    constructor() {
        super();
    }




    listen(port, callback) {

        const server = http.createServer((req, res) => {
            const myURL = new URL(req.url, 'http://' + req.headers.host);
            const pathURL = myURL.pathname;
            const urlParams =  Object.fromEntries(myURL.searchParams);

            req.url = pathURL;
            req.query = urlParams;

            Shadowgraph(req, res, () => {
                this.__addHelper(res);
               EasyCors(req, res, () =>{
                               
                Teleforce(req, res, () => {
                    const done = (err) => {
                        if (!err) {
                            res.statusCode = 404;
                            res.end('Not Found')
                        }
                        else {
                            BlackBox.ignite(err, req, res);
                        }
                    }

                    let dataString = ''
                    req.on('data', chunk => {
                        dataString += chunk;

                    })

                    req.on('end', () => {
                        try {
                            if (dataString) {
                                req.body = JSON.parse(dataString);
                            }
                            else {
                                req.body = {}
                            }
                        }
                        catch (error) {
                            req.body = {}
                        }
                        this.handle(req, res, done);

                    });
                })
               })
            })
        })
        server.listen(port, callback);
    }

    __addHelper(res) {
        res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        }

        res.send = (data) => {
            res.setHeader('Content-Type', 'text/plain');
            res.end(data);
        }
    }


}

export default Core;
