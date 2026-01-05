import fs from 'fs/promises'
import { spawn } from 'child_process'
import chalk from 'chalk'
class LiveCurrent{
    constructor(entryPoint){
        this.entryPoint = entryPoint;
        this.process =  null;
    }

    boot(){
        this.watch()
        this.ignite()
    }

    ignite(){
        this.process=  spawn('node', [this.entryPoint], {stdio: 'inherit'});
        console.log(chalk.greenBright(`LiveCurrent: Iniciando Servidor...`));
    }
    reload(){
        if(this.process){
            this.process.kill()
            this.ignite()
        }
    }

    watch(){
        fs.watch(process.cwd(), {recursive: true}, (eventType, filename) => {
            if(filename.includes('node_modules') || filename === ''){
                return
            }
            this.reload()
        })
    }

}


export default LiveCurrent;