#!/usr/bin/env node
import inquirer from "inquirer"
import { spawn } from "cross-spawn"
import { scripts, principalScripts, secondaryScripts } from "../lib/scripts.js"
import { capitalize, closeTerminal } from "../lib/utils.js"

const run = async (command) => {
    const params = []

    if (command === "start" || command === "deploy-new") {
        const res = await inquirer.prompt([
            { type: "input", name: "store", message: "Enter the store URL:", default: "your-store.myshopify.com" }
        ])
        params.push(res.store)
    }

    if (command === "deploy-new") {
        const res = await inquirer.prompt([
            { type: "input", name: "themeName", message: "Enter the new theme name:" }
        ])
        params.push(res.themeName)
    }

    if(!!!scripts[command]) {
        console.error(`❌ Command not found: ${capitalize(command)}`)
        closeTerminal(1)
        return
    }

    console.log("")
    console.log(`🚀 Running command: ${capitalize(command)}`)
    console.log("")

    const [cmd, args] = scripts[command](...params)

    const child = spawn(cmd, args, { stdio: "inherit", shell: true })
    child.on("close", (code) => {
        closeTerminal(code)
    })
}

const init = async () => {
    console.clear()
    console.log("👋 Welcome to Shopirun!")
    console.log("")

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