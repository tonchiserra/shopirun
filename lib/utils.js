import inquirer from "inquirer"
import { config } from "./config.js"

export const capitalize = (str) => (str.charAt(0).toUpperCase() + str.slice(1)).replaceAll("-", " ").replaceAll("json", "JSON")

export const closeTerminal = (code, customMessage = '', clear = true) => {
    // clear = false keeps the previous output on screen (e.g. the Shopify push preview URL)
    if(clear) console.clear()

    if (code !== 0) {
        if(!!customMessage) console.error(customMessage)
        else console.error(`❌ Command failed with exit code ${code}`)
    }else {
        log("✅ Process finished successfully!\n👋 Goodbye!")
    }

    process.exit(code)
}

export const getStoreFlag = async () => {
    let store = ''
    if(!!config.store) store = config.store
    else {
        let res = await inquirer.prompt([
            { type: "input", name: "store", message: "Enter the store URL:", default: "your-store.myshopify.com" }
        ])
        store = res.store
    }

    log(`🛍️  Running on store: ${store}`)

    return `--store=${store.replace('.myshopify.com', '')}.myshopify.com`
}

export const getThemeFlag = async () => {
    let themeFlag = ""

    let themes = !!config.themes ? Object.keys(config.themes) : []

    let res = await inquirer.prompt([
        {
            type: "list",
            name: "theme",
            message: "Select theme:",
            choices: [
                "Dev",
                ...themes,
                "Other",
                "Exit"
            ]
        }
    ])

    if(themes.includes(res.theme)) {
        return `--theme=${config.themes[res.theme]}`
    }

    if(res.theme === "Exit") closeTerminal(0)

    if(res.theme === 'Other') {
        let inputRes = await inquirer.prompt([
            { type: "input", name: "themeId", message: "Enter the Theme ID:", default: "E.g: 166962921755" }
        ])

        return `--theme=${inputRes.themeId}`
    }

    return themeFlag
}

export const log = (message) => {
    console.log("")
    console.log(message)
    console.log("")
}

export const getVersion = async () => {
    const { readFileSync } = await import('fs')
    const { resolve, dirname } = await import('path')
    const { fileURLToPath } = await import('url')
    
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'))
    
    return packageJson.version
}

export const getDate = () => {
    let date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    return date
}