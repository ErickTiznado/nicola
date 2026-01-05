import fs from 'fs'
import path from 'path'


class Regulator{



    static load(){
        const CURRENT_DIR = path.join(process.cwd(), ".env")

        if(fs.existsSync(CURRENT_DIR)){
            const envFile= fs.readFileSync(CURRENT_DIR, 'utf-8');
            let lineEnv = envFile.split('\n')
            lineEnv.forEach(line => {
                let lineClean = line.trim()
                if(lineClean.length === 0 || lineClean.startsWith('#')){
                    return;
                }
                let index = lineClean.indexOf('=')
                if(index === -1){
                    return;
                }

                let key = lineClean.substring(0, index);
                let value =  lineClean.substring(index + 1);

                key = key.trim()
                value = value.trim()

                process.env[key] = value;
            })
        }

    }
}

export default Regulator;
