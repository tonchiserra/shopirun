# shopirun

A simple CLI tool to streamline Shopify theme development and deployment workflows.

## Features
- Start a local development server for your Shopify theme
- Deploy theme changes to your Shopify store
- Pull theme files from your store
- Select commands interactively or run directly via CLI arguments

## Installation

Install globally via npm:

```bash
npm install -g shopirun
```

## Usage

Run the CLI and select a command from the menu:

```bash
shopirun
```

Or run a command directly:

```bash
shopirun start
shopirun deploy
shopirun pull
```

### Available Commands
- `start` – Start local development (prompts for store URL)
- `deploy` – Deploy theme (ignores settings_data.json and templates/*.json)
- `deploy-all` – Deploy all theme files
- `pull` – Pull all theme files from the store
- `pull-merch` – Pull only merchant-editable files (no delete)

## Requirements
- Node.js >= 14
- Shopify CLI (installed automatically via dependencies)

## License
ISC

---

Made with ❤️ by tonchiserra
