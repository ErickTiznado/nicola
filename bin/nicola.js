#!/usr/bin/env node
import { yellow } from "../utils/console.js";
import { runInit } from "./init.js"
import { runStart } from "./start.js";

const verb = process.argv[2]

try {
    switch (verb) {
        case "init": {
            const projectName = process.argv[3]
            await runInit(projectName);
            break;
        }
        case "start": {
            runStart();
            break;
        }
        default: {
            console.log(yellow("Comando no reconocido. Prueba: nicola init <nombre> o nicola start"))
            process.exitCode = 1;
        }
    }
} catch (err) {
    console.error(err);
    process.exitCode = 1;
}