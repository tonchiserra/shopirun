export const principalScripts = {
    "start": (...flags) => [
        "npx",
        ["shopify", "theme", "dev", "--live-reload=hot-reload", "--theme-editor-sync", "--path=.", ...flags]
    ],
    "pull-all": () => [
        "npx",
        ["shopify", "theme", "pull", "--path=."]
    ],
    "pull-jsons": () => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "-o", "templates/*.json", "config/settings_data.json", "locales/*.json", "--path=."]
    ],
    "deploy-all": () => [
        "npx",
        ["shopify", "theme", "push", "--path=."]
    ],
    "deploy-without-jsons": () => [
        "npx",
        ["shopify", "theme", "push", "--ignore", "config/settings_data.json", "templates/*.json", "locales/*.json", "--path=."]
    ]
}

export const secondaryScripts = {
    "pull-locales": () => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "locales/*.json", "--path=."]
    ],
    "pull-templates": () => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "-o", "templates/*.json", "--path=."]
    ],
    "pull-config": () => [
        "npx",
        ["shopify", "theme", "pull", "--nodelete", "config/settings_data.json", "--path=."]
    ],
    "deploy-locales": () => [
        "npx",
        ["shopify", "theme", "push", "-o", "locales/*.json", "--path=."]
    ],
    "deploy-templates": () => [
        "npx",
        ["shopify", "theme", "push", "-o", "templates/*.json", "--path=."]
    ],
    "deploy-config": () => [
        "npx",
        ["shopify", "theme", "push", "-o", "config/settings_data.json", "--path=."]
    ],
    "deploy-jsons": () => [
        "npx",
        ["shopify", "theme", "push", "-o", "*.json", "--path=."]
    ],
    "deploy-new": (...flags) => [
        "npx",
        ["shopify", "theme", "push", "--unpublished", "--path=.", ...flags]
    ]
}

export const scripts = { ...principalScripts, ...secondaryScripts }