const EasyCors = (options = {}) => {
  const allowedOrigin = options.origin || "*";

  return (req, res, next) => {
    const whitelist = Array.isArray(allowedOrigin)
      ? allowedOrigin
      : [allowedOrigin];
    const incomingOrigin = req.headers.origin;
    if ((incomingOrigin && whitelist.includes(incomingOrigin)) || (whitelist.includes('*'))) {
      if (whitelist.includes("*")) {
            res.setHeader("Access-Control-Allow-Origin", `*`);
      }
      else{
              res.setHeader("Access-Control-Allow-Origin", `${req.headers.origin}`);
      }
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      } else {
        next();
      }
    } else {
      next();
    }
  };
};

export default EasyCors;
