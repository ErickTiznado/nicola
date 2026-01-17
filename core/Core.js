import http from "http";
import Remote from "./Remote.js";
import BlackBox from "../middlewares/BlackBox.js";
import Shadowgraph from "../middlewares/Shadowgraph.js";
import Teleforce from "../middlewares/Teleforce.js";
import EasyCors from "../middlewares/EasyCors.js";
import {readBuffer} from "../utils/buffer.js";
import { parseMultipart, getBoundary } from "../utils/multipart.js";
class Core extends Remote {
  constructor() {
    super();
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => {
      const myURL = new URL(req.url, "http://" + (req.headers.host ?? 'localhost'));
      const pathURL = myURL.pathname;
      const urlParams = Object.fromEntries(myURL.searchParams);

      req.url = pathURL;
      req.query = urlParams;

      Shadowgraph(req, res, () => {
        this.__addHelper(res);
        EasyCors()(req, res, () => {
          Teleforce(req, res, async () => {
            const done = (err) =>{
              if(!err){
                res.statusCode = 404;
                res.end("Not Found");
              }
              else{
                BlackBox.ignite(err, req, res);
              }
            }
            try {
            const contentType = req.headers['content-type'] || '';
            if (contentType.startsWith('multipart/form-data')){
              const buffer = await readBuffer(req);
              const boundary = getBoundary(contentType);
              if(!boundary){
                throw new Error("No boundary found in Content-Type");
              }
              const parts = parseMultipart(buffer, boundary);
              req.body =  parts.fields;
              req.files = parts.files;


            }
            else if(contentType.includes('application/json')){
              const buffer = await readBuffer(req);
              const text = buffer.toString('utf-8');
              try{
                req.body = JSON.parse(text);
              }
              catch(e){
                throw new Error("Invalid JSON");
              }
            }
            else{
              req.body = {};
            }
            this.handle(req, res, done);
          }
          catch(err){
            if(err.message === 'Request Entity Too Large'){
              res.statusCode = 413;
              res.end(err.message);
              return;
            }

            if(err.message === 'Invalid JSON' || err.message === 'No boundary found in Content-Type'){
              res.statusCode = 400;
              res.end(err.message);
              return;
            }
            else{
              res.statusCode = 500;
              res.end('Internal Server Error');
              console.error(err);
              return;
            }
          }
          });
        });
      });
    });

    const requestTimeout = Number(process.env.NICOLA_REQUEST_TIMEOUT)
    if (!Number.isNaN(requestTimeout) && requestTimeout > 0) {
      server.requestTimeout = requestTimeout
    }

    const headersTimeout = Number(process.env.NICOLA_HEADERS_TIMEOUT)
    if (!Number.isNaN(headersTimeout) && headersTimeout > 0) {
      server.headersTimeout = headersTimeout
    }

    const keepAliveTimeout = Number(process.env.NICOLA_KEEP_ALIVE_TIMEOUT)
    if (!Number.isNaN(keepAliveTimeout) && keepAliveTimeout > 0) {
      server.keepAliveTimeout = keepAliveTimeout
    }

    server.listen(port, callback);
    return server;
  }

  __addHelper(res) {
    res.json = (data) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    };

    res.send = (data) => {
      res.setHeader("Content-Type", "text/plain");
      res.end(data);
    };
  }
}

export default Core;
