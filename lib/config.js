import fs from 'fs'
import path from 'path'

import { log } from './utils.js'

const configPath = path.resolve(process.cwd(), 'shopirun.config.json')
let configData = {}

try {
    const rawData = fs.readFileSync(configPath, 'utf-8')
    configData = JSON.parse(rawData)
    
} catch (err) {
    log(`❌ Configuration file not found. Remember you can create a shopirun.config.json file in the project root.`)
}

export const config = configData