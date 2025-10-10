# shopirun

A simple CLI tool to streamline Shopify theme development and deployment workflows.

## Features
- 🚀 **Start Development Server** – Launch local development server with hot-reload and theme editor sync
- 📦 **Smart Deployment** – Deploy all files or specific file types with backup options
- 📥 **Selective File Pulling** – Pull all theme files or target specific file types (JSON, locales, templates)
- 🎯 **Interactive Menu System** – User-friendly interface with organized principal and secondary commands
- ⚙️ **Configuration Support** – Store settings and theme configurations in `shopirun.config.json`
- 🎨 **Theme Management** – Create new unpublished themes and manage multiple theme environments
- 💾 **Automatic Backups** – Create timestamped backups before major deployments
- 📋 **Direct Command Execution** – Run commands directly from terminal or through interactive menu

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

Or run a command directly. For Example:

```bash
shopirun start
shopirun deploy-all
shopirun pull-jsons
shopirun make-backup-and-deploy-all
```

### Backup Feature
Commands with `make-backup-and-` prefix automatically create a timestamped backup of the selected theme before making changes. Backup themes are named with the format: `[Backup DD/MM] | Shopirun`

### Principal Commands
- **`start`** – Start local development server with hot-reload and theme editor sync
- **`pull-all`** – Pull all theme files from the store
- **`pull-jsons`** – Pull only JSON files (templates, config, locales) without deleting existing files
- **`make-backup-and-deploy-all`** – Create a timestamped backup and deploy all theme files
- **`deploy-all`** – Deploy all theme files to the selected theme
- **`make-backup-and-deploy-without-jsons`** – Create backup and deploy excluding JSON files
- **`deploy-without-jsons`** – Deploy theme files excluding JSON configuration files

### Secondary Commands (via "Other" menu)
- **`pull-locales`** – Pull only translation/locale files
- **`pull-templates`** – Pull only template JSON files  
- **`pull-config`** – Pull only settings_data.json configuration
- **`deploy-locales`** – Deploy only locale/translation files
- **`deploy-templates`** – Deploy only template JSON files
- **`deploy-config`** – Deploy only settings_data.json
- **`deploy-jsons`** – Deploy all JSON files (templates, config, locales)
- **`deploy-new`** – Create and deploy as new unpublished theme

## Configuration

Create a `shopirun.config.json` file in your project root to streamline your workflow:

```json
{
    "store": "your-store.myshopify.com",
    "themes": {
        "staging": 123456789,
        "live": 987654321
    }
}
```

### Configuration Options
- **`store`** (string): Your Shopify store URL (automatically formats to .myshopify.com)
- **`themes`** (object, optional): Map custom theme names to their IDs for quick selection

### Benefits
- ✅ Skip store URL input on every command
- ✅ Quick theme selection by name instead of entering IDs
- ✅ Support for multiple environments (dev, staging, production)
- ✅ Automatic error handling for missing or invalid configuration

If no configuration file is found, the CLI will prompt for required information and show a helpful reminder about creating the config file.

## Requirements
- Node.js >= 14
- Shopify CLI v3.x (automatically installed via `@shopify/cli` dependency)
- Access to a Shopify store and theme development permissions

## How It Works
Shopirun is a wrapper around the official Shopify CLI that provides:
- Simplified command structure with intuitive naming
- Interactive prompts for theme and store selection  
- Automatic backup creation before destructive operations
- Organized menu system separating principal and secondary commands
- Smart parameter handling and validation

## Troubleshooting

### Common Issues
- **"Command not found"**: Ensure shopirun is installed globally with `-g` flag
- **Configuration errors**: Check that your `shopirun.config.json` has valid JSON syntax
- **Theme ID errors**: Verify theme IDs are numbers, not strings in the config file
- **Store access**: Ensure you're logged into Shopify CLI (`shopify auth login`)

### Getting Help
Run `shopirun` to access the interactive menu system.

## Contributing
Issues and pull requests are welcome! Please check the [GitHub repository](https://github.com/tonchiserra/shopirun) for the latest updates.

## License
ISC

---

Made with ❤️ by [tonchiserra](https://github.com/tonchiserra)
