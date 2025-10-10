import { getDate } from "./utils.js"

export const principalScripts = {
    "start": (...flags) => [
        "npx",
        ["shopify", "theme", "dev", "--live-reload=hot-reload", "--theme-editor-sync", "--path=.", ...flags]
    ],
    "pull-all": (...flags) => [
        "npx",
        ["shopify", "theme", "pull", "--path=.", ...flags]
    ],
    "pull-jsons": (...flags) => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "-o", "templates/*.json", "config/settings_data.json", "locales/*.json", "--path=.", ...flags]
    ],
    "make-backup-and-deploy-all": (...flags) => [
        "npx",
        ["shopify", "theme", "duplicate", "--force", `--name="[Backup ${getDate()}] | Shopirun"`, ...flags, "&&", "shopify", "theme", "push", "--path=.", ...flags]
    ],
    "deploy-all": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "--path=.", ...flags]
    ],
    "make-backup-and-deploy-without-jsons": (...flags) => [
        "npx",
        ["shopify", "theme", "duplicate", "--force", `--name="[Backup ${getDate()}] | Shopirun"`, ...flags, "&&", "shopify", "theme", "push", "--ignore", "config/settings_data.json", "templates/*.json", "locales/*.json", "--path=.", ...flags]
    ],
    "deploy-without-jsons": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "--ignore", "config/settings_data.json", "templates/*.json", "locales/*.json", "--path=.", ...flags]
    ]
}

export const secondaryScripts = {
    "pull-locales": (...flags) => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "locales/*.json", "--path=.", ...flags]
    ],
    "pull-templates": (...flags) => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "-o", "templates/*.json", "--path=.", ...flags]
    ],
    "pull-config": (...flags) => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "config/settings_data.json", "--path=.", ...flags]
    ],
    "deploy-locales": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "-o", "locales/*.json", "--path=.", ...flags]
    ],
    "deploy-templates": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "-o", "templates/*.json", "--path=.", ...flags]
    ],
    "deploy-config": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "-o", "config/settings_data.json", "--path=.", ...flags]
    ],
    "deploy-jsons": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "-o", "*.json", "--path=.", ...flags]
    ],
    "deploy-new": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "--unpublished", "--path=.", ...flags]
    ]
}

export const scripts = { ...principalScripts, ...secondaryScripts }