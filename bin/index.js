#!/usr/bin/env node
import inquirer from "inquirer"
import { spawn } from "cross-spawn"
import { scripts, principalScripts, secondaryScripts } from "../lib/scripts.js"
import { capitalize, closeTerminal, getThemeFlag, log } from "../lib/utils.js"
import { config } from "../lib/config.js"

const run = async (command) => {
    const params = []

    if(command === "start" || command === "deploy-new") {
        let store = ''
        if(!!config.store) store = config.store
        else {
            let res = await inquirer.prompt([
                { type: "input", name: "store", message: "Enter the store URL:", default: "your-store.myshopify.com" }
            ])
            store = res.store
        }

        params.push(`--store=${store.replace('.myshopify.com', '')}.myshopify.com`)
        log(`🛍️ Running on store: ${store}`)
    }

    if(command === "start") {
        let themeFlag = await getThemeFlag()
        params.push(themeFlag)
    }

    if(command === "deploy-new") {
        let res = await inquirer.prompt([
            { type: "input", name: "themeName", message: "Enter the new theme name:" }
        ])
        params.push(`--theme="${res.themeName}"`)
        log(`🎨 Creating new theme: ${res.themeName}`)
    }

    if(!!!scripts[command]) {
        console.error(`❌ Command not found: ${capitalize(command)}`)
        closeTerminal(1)
        return
    }

    log(`🚀 Running command: ${capitalize(command)}`)

    const [cmd, args] = scripts[command](...params)

    const child = spawn(cmd, args, { stdio: "inherit", shell: true })
    child.on("close", (code) => {
        closeTerminal(code)
    })
}

const init = async () => {
    console.clear()
    const { readFileSync } = await import('fs')
    const { resolve, dirname } = await import('path')
    const { fileURLToPath } = await import('url')
    
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'))
    log(`👋 Welcome to Shopirun! v${packageJson.version}`)

    // run command from arg if exists. E.g. `shopirun start`
    const argCommand = process.argv[2]
    if(argCommand && scripts[argCommand]) {
        await run(argCommand)
        return
    }

    // run command from menu
    let command = ""
    let showMenu = true
    do {
        let firstMenuRes = await inquirer.prompt([
            {
                type: "list",
                name: "command",
                message: "Select command:",
                choices: [
                    ...Object.keys(principalScripts).map(key => capitalize(key)),
                    "Other",
                    "Exit"
                ]
            }
        ])

        command = firstMenuRes.command.replace(" ", "-").toLowerCase()
        showMenu = false

        if(command === "other") {
            let secondMenuRes = await inquirer.prompt([
                {
                    type: "list",
                    name: "command",
                    message: "Select command:",
                    choices: [
                        ...Object.keys(secondaryScripts).map(key => capitalize(key)),
                        "Back",
                        "Exit"
                    ]
                }
            ])

            command = secondMenuRes.command.replace(" ", "-").toLowerCase()
            if(command === "back") showMenu = true
        }

    } while(showMenu)

    if(command === "exit") closeTerminal(0)

    await run(command)
}

init()