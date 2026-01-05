import crypto from 'crypto'
import Regulator from './Regulator.js';

class Coherer{
    constructor(){

    }
    static SECRET = process.env.NICOLA_SECRET || 'nicola_secret_dev_key'

    static codec(jsonData){
        const dataString = JSON.stringify(jsonData);
        const buffer =  Buffer.from(dataString);
        return buffer.toString('base64url')
    }

    static sign(Payload){
        const payloadB64 = this.codec(Payload);
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        }
        const headerB64 = this.codec(header)

        const data = headerB64 + '.' + payloadB64

        const signature = crypto.createHmac('sha256', this.SECRET)
                                .update(data)
                                .digest('base64url')

        return data + '.' + signature
    }
    static verify(data){
       const [headerB64, payloadB64, signature] = data.token.split('.');

        const dataToCheck =  headerB64 + '.' + payloadB64

        const signatureToChecks = crypto.createHmac('sha256', this.SECRET)
                                .update(dataToCheck)
                                .digest('base64url')

        if(signature === signatureToChecks){
            let decodedPayload = Buffer.from(payloadB64, 'base64url').toString('utf-8')
            decodedPayload = JSON.parse(decodedPayload)
            return decodedPayload
        }
        else{
            throw new Error('Token Invalido')
        }
    }
}


export default Coherer;