import crypto from "crypto";
import { getExpTime } from "../utils/expTime.js";

class Coherer {
  constructor() {}

  static _getSecret() {
    const secret = process.env.NICOLA_SECRET
    if (!secret) {
      throw new Error("Please configure, NICOLA_SECRET in the .env file")
    }
    return secret
  }

  static codec(jsonData) {
    const dataString = JSON.stringify(jsonData);
    const buffer = Buffer.from(dataString);
    return buffer.toString("base64url");
  }

  static sign(Payload, options) {
    const SECRET = this._getSecret()

    let payloadB64 = "";

    if (options && "expiresIn" in options) {
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
    const SECRET = this._getSecret()

    if (typeof token !== "string") {
      throw new Error("Token Invalido")
    }

    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Token Invalido")
    }

    const [headerB64, payloadB64, signature] = parts;

    let decodedHeader;
    try {
      decodedHeader = Buffer.from(headerB64, "base64url").toString("utf-8")
      decodedHeader = JSON.parse(decodedHeader)
    } catch {
      throw new Error("Token Invalido")
    }

    if (decodedHeader?.alg !== "HS256" || decodedHeader?.typ !== "JWT") {
      throw new Error("Token Invalido")
    }

    const dataToCheck = headerB64 + "." + payloadB64;

    const signatureToChecks = crypto
      .createHmac("sha256", SECRET)
      .update(dataToCheck)
      .digest("base64url");

    const sigA = Buffer.from(signature)
    const sigB = Buffer.from(signatureToChecks)
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      throw new Error("Token Invalido")
    }

    let decodedPayload;
    try {
      decodedPayload = Buffer.from(payloadB64, "base64url").toString("utf-8")
      decodedPayload = JSON.parse(decodedPayload)
    } catch {
      throw new Error("Token Invalido")
    }

    if ("exp" in decodedPayload) {
      const datenow = Date.now() / 1000;
      if (datenow > decodedPayload.exp) {
        throw new Error("Token Expired")
      }
    }

    return decodedPayload;
  }
}

export default Coherer;
