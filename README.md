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
- 🤖 **Claude Code Integration** – Sync skills and commands from a shared GitHub repository

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
- **`deploy-staging`** – Deploy to the staging theme, optionally merging every open PR labeled `staging`
- **`deploy-all`** – Deploy all theme files to the selected theme
- **`make-backup-and-deploy-without-jsons`** – Create backup and deploy excluding JSON files
- **`deploy-without-jsons`** – Deploy theme files excluding JSON configuration files
- **`sync-skills`** – Sync Claude Code skills from a shared GitHub repository
- **`sync-commands`** – Sync Claude Code commands from a shared GitHub repository

### Deploy Staging
Deploys to your staging theme without asking you to pick a theme every time, and can build a combined preview of everything currently under review.

```bash
shopirun deploy-staging
```

The staging theme is resolved from the `staging` key in `shopirun.config.json` (matched case-insensitively, so `staging`, `Staging` and `STAGING` all work). If there is no such key — or no config file at all — the Shopify CLI shows its own theme list instead.

You are then asked two questions:

1. **What to deploy** – the current working tree, or all open PRs labeled `staging`
2. **Which files** – everything, or everything except the JSONs

Choosing the PRs option creates a local integration branch named `staging-deploy-DD-MM` from the repository default branch and merges the head branch of every open PR labeled `staging` into it, then deploys the result. When it finishes you are returned to the branch you started on, and the integration branch is kept locally so you can inspect what was deployed. It is never pushed to origin.

The command stops without deploying anything if the working tree has uncommitted changes, if no PRs carry the label, or if any merge conflicts — in that last case it reports the PR and the conflicting files so you can resolve them on the integration branch. PRs from forks are skipped with a warning. No theme backup is created, since staging is meant to be disposable.

> Avoid pressing `Ctrl+C` while the merges are running: the CLI exits immediately and may leave you on the integration branch. `git checkout <your-branch>` gets you back.

### Claude Code Sync Commands
Sync skills and commands for Claude Code from a shared GitHub repository. Perfect for teams that want to keep their Claude Code tools synchronized.

```bash
shopirun sync-skills    # Sync skills to ~/.claude/skills/ or ./.claude/skills/
shopirun sync-commands  # Sync commands to ~/.claude/commands/ or ./.claude/commands/
```

When running these commands, you'll be prompted to choose:
- **Global** – Syncs to `~/.claude/skills/` or `~/.claude/commands/`
- **Local** – Syncs to `./.claude/skills/` or `./.claude/commands/` in current directory

The sync is smart: it adds new files, updates existing ones, but never deletes local files that aren't in the repository.

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
- **`skillsRepoUrl`** (string, optional): Custom GitHub repository URL for Claude Code skills
- **`commandsRepoUrl`** (string, optional): Custom GitHub repository URL for Claude Code commands
- **`skillsRepoPath`** (string, optional): Path within the repository where skills are located (default: `skills`)
- **`commandsRepoPath`** (string, optional): Path within the repository where commands are located (default: `commands`)

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
- [GitHub CLI](https://cli.github.com) (`gh`), authenticated with `gh auth login` – only needed to deploy the staging PRs with `deploy-staging`

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
