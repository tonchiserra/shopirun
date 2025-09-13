#!/usr/bin/env node
import inquirer from "inquirer"
import { spawn } from "cross-spawn"

const scripts = {
    start: (store) => [
        "npx",
        ["shopify", "theme", "dev", `--store=${store}`, "--theme-editor-sync", "--path=."]
    ],
    deploy: () => [
        "npx",
        ["shopify", "theme", "push", "--ignore", "config/settings_data.json", "templates/*.json", "--path=."]
    ],
    "deploy-all": () => [
        "npx",
        ["shopify", "theme", "push", "--path=."]
    ],
    pull: () => [
        "npx",
        ["shopify", "theme", "pull", "--path=."]
    ],
    "pull-merch": () => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "-o", "templates/*.json", "config/settings_data.json", "locales/*.json", "--path=."]
    ]
}

const run = async (command) => {
    let store = ""
    if (command === "start") {
        const res = await inquirer.prompt([
            { type: "input", name: "store", message: "Ingrese la URL de la tienda:" }
        ])
        store = res.store
    }

    const [cmd, args] = scripts[command](store)

    const child = spawn(cmd, args, { stdio: "inherit", shell: true })
    child.on("close", (code) => process.exit(code))
}

const init = async () => {
    // run command from arg if exists. E.g. `shopirun start`
    const argCommand = process.argv[2]
    if(argCommand && scripts[argCommand]) {
        await run(argCommand)
        return
    }

    // run command from menu
    const { command } = await inquirer.prompt([
        {
            type: "list",
            name: "command",
            message: "Selecciona un comando:",
            choices: Object.keys(scripts).map(key => (key.charAt(0).toUpperCase() + key.slice(1)).replace("-", " "))
        }
    ])
    await run(command.toLowerCase().replace(" ", "-"))
}

init()