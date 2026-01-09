import http from "http";
import Remote from "./Remote.js";
import BlackBox from "../middlewares/BlackBox.js";
import Shadowgraph from "../middlewares/Shadowgraph.js";
import Teleforce from "../middlewares/Teleforce.js";
import EasyCors from "../middlewares/EasyCors.js";
class Core extends Remote {
  constructor() {
    super();
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => {
      const myURL = new URL(req.url, "http://" + req.headers.host);
      const pathURL = myURL.pathname;
      const urlParams = Object.fromEntries(myURL.searchParams);

      req.url = pathURL;
      req.query = urlParams;

      Shadowgraph(req, res, () => {
        this.__addHelper(res);
        EasyCors(req, res, () => {
          Teleforce(req, res, () => {
            const done = (err) => {
              if (!err) {
                res.statusCode = 404;
                res.end("Not Found");
              } else {
                BlackBox.ignite(err, req, res);
              }
            };
            if (req.headers["content-type"]?.includes("application/json")) {
              let dataString = [];
              let chunklenght = 0;
              req.on("data", (chunk) => {
                dataString.push(chunk);
                chunklenght = chunklenght + chunk.length;

                if (chunklenght > 2e6) {
                  req.pause();
                  res.statusCode = 413;
                  res.end("Request Entity Too Large");
                  return;
                }
              });

              req.on("end", () => {
                try {
                  if (dataString.length > 0) {
                    const buffer = Buffer.concat(dataString).toString();
                    req.body = JSON.parse(buffer);
                  } else {
                    req.body = {};
                  }
                } catch (error) {
                  res.statusCode = 400;
                  res.end("Bad Request: Invalid JSON");
                  return;
                }
                this.handle(req, res, done);
              });
            }
            else {
                req.body = {};
                this.handle(req, res, done);
            }
          });
        });
      });
    });
    server.listen(port, callback);
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
