import crypto from "crypto";
import Regulator from "./Regulator.js";
import { getExpTime } from "../utils/expTime.js";

class Coherer {
  constructor() {}

  static codec(jsonData) {
    const dataString = JSON.stringify(jsonData);
    const buffer = Buffer.from(dataString);
    return buffer.toString("base64url");
  }

  static sign(Payload, options) {
    const SECRET = process.env.NICOLA_SECRET
    if (!SECRET)
      throw new Error("Please configure, NICOLA_SECRET in the .env file");

    let payloadB64 = "";

    if ("expiresIn" in options) {
      const time = getExpTime(options.expiresIn);
      const newPayload = { ...Payload, exp: time };
      payloadB64 = this.codec(newPayload);
    } else {
      throw new Error("Expire time invalid");
    }

    const header = {
      alg: "HS256",
      typ: "JWT",
    };
    const headerB64 = this.codec(header);

    const data = headerB64 + "." + payloadB64;

    const signature = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");

    return data + "." + signature;
  }

  static verify(token) {
    const SECRET = process.env.NICOLA_SECRET
        if (!SECRET)
      throw new Error("Please configure, NICOLA_SECRET in the .env file");
    const [headerB64, payloadB64, signature] = token.split(".");

    const dataToCheck = headerB64 + "." + payloadB64;

    const signatureToChecks = crypto
      .createHmac("sha256", SECRET)
      .update(dataToCheck)
      .digest("base64url");

    if (signature === signatureToChecks) {
      let decodedPayload = Buffer.from(payloadB64, "base64url").toString(
        "utf-8"
      );

      decodedPayload = JSON.parse(decodedPayload);
      if ("exp" in decodedPayload) {
        const datenow = Date.now() / 1000;

        if (datenow > decodedPayload.exp) {
          throw new Error("Token Expired");
        }
      }
      return decodedPayload;
    } else {
      throw new Error("Token Invalido");
    }
  }
}

export default Coherer;
