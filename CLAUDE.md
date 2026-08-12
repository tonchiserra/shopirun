# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shopirun is a CLI wrapper around Shopify CLI that simplifies theme development and deployment workflows. It provides an interactive menu system and direct command execution for common Shopify theme operations.

## Core Architecture

### Entry Point & Flow
- **bin/index.js**: Main entry point that initializes the CLI
  - Runs commands directly via `shopirun <command>` (e.g., `shopirun start`)
  - Launches interactive menu if no command argument provided
  - Menu has two levels: principal commands and secondary commands (accessed via "Other")

### Module Structure
- **lib/scripts.js**: Defines all available commands that wrap Shopify CLI
  - `principalScripts`: Main commands shown in first menu (start, pull-all, deploy-all, etc.)
  - `secondaryScripts`: Specialized commands in "Other" menu (pull-locales, deploy-templates, etc.)
  - Each script returns `[command, args]` tuple for spawning processes
  - Commands prefixed with `make-backup-and-` automatically duplicate theme before deploying

- **lib/config.js**: Handles `shopirun.config.json` configuration
  - Loads store URL and theme mappings from project root
  - Gracefully handles missing config with fallback prompts

- **lib/utils.js**: Shared utilities
  - `getThemeFlag()`: Interactive theme selection (Dev, configured themes, or manual ID entry)
  - `capitalize()`: Formats command names for display
  - `closeTerminal()`: Standardized exit handling
  - `getVersion()`: Reads version from package.json
  - `getDate()`: Formats date for backup theme names

### Command Execution Pattern
All commands follow this flow in `bin/index.js`:
1. Get store URL (from config or prompt)
2. Add command-specific parameters (theme selection, backup creation, etc.)
3. Validate command exists in scripts
4. Spawn Shopify CLI via `cross-spawn` with inherited stdio
5. Exit on process completion

## Common Development Commands

### Testing Locally
```bash
# Link package globally for testing
npm link

# Run commands
shopirun start
shopirun deploy-all
```

### Publishing
```bash
# Update version in package.json
npm version patch|minor|major

# Publish to npm
npm publish
```

## Key Implementation Details

### Shopify CLI Integration
- All commands use `npx shopify theme <subcommand>` under the hood
- Store parameter always formatted as `--store=<name>.myshopify.com`
- Theme selection uses `--theme=<id>` or `--theme=<name>` flags
- Dev command includes `--live-reload=hot-reload --theme-editor-sync --open`

### Custom Handlers
- Commands that don't map to a single Shopify CLI invocation are registered as `null` in `lib/scripts.js` (so they still appear in the menu and pass the `argCommand in scripts` check) plus a function in the `customHandlers` map in `bin/index.js`
- Custom handlers early-return before store/theme resolution, so they must call `getStoreFlag()` themselves if they need the store
- `closeTerminal(code, customMessage, clear)` clears the screen by default, which wipes child-process output; pass `clear = false` when the previous output matters (e.g. the Shopify push preview URL)

### Deploy Staging
- `deploy-staging` is a custom handler (`lib/handlers/deployStaging.js`) — it needs conditional prompts, N git commands and only then a push
- Resolves the theme by case-insensitive match on the `staging` key of `config.themes`; returns an empty theme flag when absent so the Shopify CLI prompts with its own theme list
- Reuses the `deploy-all` / `deploy-without-jsons` factories from `lib/scripts.js` for the push instead of duplicating Shopify flags
- Git and `gh` calls go through a local `exec()` on `cross-spawn`'s `sync` with `shell: false`, so branch names are never interpolated into a shell string
- PR mode requires the `gh` CLI, an authenticated session and a clean working tree; it aborts on merge conflicts without deploying

### Backup System
- Backup commands use `shopify theme duplicate --force --name="[Backup DD/MM] | Shopirun"`
- Date format uses Spanish locale ('es-ES') for DD/MM format
- Commands chain duplicate and push using `&&` operator

### File Selection Patterns
- JSON deployments: `templates/*.json config/settings_data.json locales/*.json`
- Deploy without JSONs: uses `--ignore` flag for config, templates, locales, and sections
- Pull commands use `--nodelete` to preserve local files not on remote
- Pull uses `-o` flag for only specified patterns

### Configuration Format
```json
{
  "store": "your-store.myshopify.com",
  "themes": {
    "staging": 123456789,
    "live": 987654321
  }
}
```

## Dependencies
- **@shopify/cli**: Official Shopify CLI (v3.x)
- **inquirer**: Interactive prompts (v12.x)
- **cross-spawn**: Cross-platform process spawning

## Important Notes
- This is an ES module project (`"type": "module"` in package.json)
- All imports must include `.js` extension
- Commands spawn shells with `{ shell: true }` for chaining support
- Theme flag is only requested for commands that need it (start, deploy with backup)
- Store URL always strips and re-adds `.myshopify.com` for consistency
