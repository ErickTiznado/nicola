import fs from "fs/promises"
import { cyan, green, magent } from "../utils/console.js";
import path from "path";
import { app } from "./schemas/app.schema.js";
import { route } from "./schemas/route.schema.js";
import { controller } from "./schemas/controller.schema.js";


export  async function runInit(projectName){
    if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
        console.log(magent('Uso: nicola init <nombre-del-proyecto>'))
        return;
    }

    const normalizedName = projectName.trim();
    const rootPath = path.join(process.cwd(), normalizedName)
    const srcPath = path.join(rootPath, 'src')
    const packageJSON = {
        name: normalizedName,
        version: "1.0.0",
        type: "module",
        main: "app.js",
        dependencies: {
            "nicola-framework" : "latest"
        },
        scripts:{
            "start": "nicola start"
        } 
        }
    try{
        // Fail fast if the directory already exists
        await fs.access(rootPath)
        throw new Error(`El directorio '${normalizedName}' ya existe.`)
    } catch (err) {
        // access failed => directory does not exist yet, continue
        if (!(err && (err.code === 'ENOENT'))) {
            throw err;
        }
    }

    try{
        await fs.mkdir(rootPath, {recursive: true});
        console.log(magent('✓ Carpeta raiz creada con exito.'))
        await fs.mkdir(srcPath, {recursive:true})
        console.log(magent('✓ Carpeta src creada con exito.'))
        await fs.writeFile(path.join(rootPath, 'package.json'), JSON.stringify(packageJSON, null, 2))
        console.log(magent("✓ Archivo package.json creado con exito."))
        await fs.mkdir(path.join(srcPath, "controllers"), { recursive: true })
        console.log(magent('✓ Carpeta controllers creada con exito.'))
        await fs.writeFile(path.join(srcPath, "controllers", "user.controller.js"), controller)
        console.log(cyan('✓ Controlador creado con exito.'))
        await fs.mkdir(path.join(srcPath, "routes"), { recursive: true })
        console.log(magent('✓ Carpeta routes creada con exito.'))
        await fs.writeFile(path.join(srcPath, "routes", "user.Routes.js"), route)
        console.log(cyan('✓ Rutas creadas con exito.'))
        await fs.writeFile(path.join(rootPath, "app.js"), app)
        console.log(green('✓ Archivo principal app.js creado con exito.'))
        console.log(green(`\nProyecto ${normalizedName} inicializado con exito!`))
        console.log(green(`\nPara iniciar tu proyecto, ejecuta los siguientes comandos:\n`))
        console.log(cyan(`cd ${normalizedName}`))
        console.log(cyan(`npm install`))
        console.log(cyan(`nicola start\n`))
    }
    catch(err){
        console.error(err)
        throw err;
    }
}