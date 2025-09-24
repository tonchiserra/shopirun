import fs from 'fs'
import path from 'path'

const configPath = path.resolve(process.cwd(), 'shopirun.config.json')

const getConfig = () => {
    let config = {}

    try {
        if (fs.existsSync(configPath)) {
            const rawData = fs.readFileSync(configPath, 'utf-8')
            config = JSON.parse(rawData)
        } else {
            console.log("")
            console.log(`❌ Configuration file not found. Remember you can create a shopirun.config.json file in the project root.`)
            console.log("")
        }
    } catch (err) {
        console.log("")
        console.log(`❌ Error reading configuration file: ${err.message}`)
        console.log("")
    }

    return config
}

export const config = getConfig()
