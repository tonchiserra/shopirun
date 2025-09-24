# shopirun

A simple CLI tool to streamline Shopify theme development and deployment workflows.

## Features
- 🚀 Start a local development server for your Shopify theme
- 📦 Deploy theme changes to your Shopify store with various options
- 📥 Pull theme files from your store (all files or specific types)
- 🎯 Interactive menu system with organized commands
- ⚙️ Configuration file support for store settings
- 🎨 Create new unpublished themes
- 🔧 Granular control over files to deploy/pull

## Installation

Install globally via npm:

```bash
npm install -g shopirun
```

## Usage

Run the CLI and select a command from the interactive menu:

```bash
shopirun
```

Or run a command directly:

```bash
shopirun start
shopirun deploy-all
shopirun pull-jsons
```

### Main Commands
- **`start`** – Start local development server with theme editor sync
- **`pull-all`** – Pull all theme files from the store
- **`pull-jsons`** – Pull only JSON files (templates, config, locales)
- **`deploy-all`** – Deploy all theme files
- **`deploy-without-jsons`** – Deploy theme excluding JSON files

### Additional Commands (via "Other" menu)
- **`pull-locales`** – Pull only locale files
- **`pull-templates`** – Pull only template JSON files  
- **`pull-config`** – Pull only settings_data.json
- **`deploy-locales`** – Deploy only locale files
- **`deploy-templates`** – Deploy only template JSON files
- **`deploy-config`** – Deploy only settings_data.json
- **`deploy-jsons`** – Deploy only JSON files
- **`deploy-new`** – Create and deploy as new unpublished theme

## Configuration

Create a `shopirun.config.json` file in your project root to avoid entering store URL and to save theme settings:

```json
{
    "store": "your-store.myshopify.com",
    "themes": {
        "dev": 123456789,
        "live": 987654321
    }
}
```

- `store`: Your Shopify store URL.
- `themes`: (optional) Map theme names to their IDs for easier deployment and management.

This allows you to reference themes by name in the interactive menu.

## Requirements
- Node.js >= 14
- Shopify CLI (installed automatically via dependencies)

## License
ISC

---

Made with ❤️ by tonchiserra
