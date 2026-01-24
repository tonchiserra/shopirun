import fs from 'fs'
import path from 'path'
import os from 'os'
import inquirer from 'inquirer'
import { log } from '../utils.js'
import { config } from '../config.js'
import { DEFAULT_REPO, SKILLS_REPO_PATH, SKILLS_PATHS } from '../constants.js'

/**
 * Parse GitHub URL to extract owner and repo
 * @param {string} url - GitHub repository URL
 * @returns {{ owner: string, repo: string }}
 */
function parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
    if (!match) {
        throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo')
    }
    return { owner: match[1], repo: match[2] }
}

/**
 * Fetch GitHub API with error handling
 * @param {string} apiUrl - GitHub API URL
 * @returns {Promise<any>}
 */
async function fetchGitHubApi(apiUrl) {
    const response = await fetch(apiUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'shopirun-cli'
        }
    })

    if (response.status === 404) {
        throw new Error('Repository or path not found. Please check the URL.')
    }

    if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Try again later.')
    }

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

/**
 * Fetch list of skill folders from repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} repoPath - Path within repository
 * @returns {Promise<Array<{ name: string, path: string }>>}
 */
async function fetchSkillFolders(owner, repo, repoPath) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`
    const contents = await fetchGitHubApi(apiUrl)

    // Filter only directories (each directory is a skill)
    const skillFolders = contents.filter(item => item.type === 'dir')

    if (skillFolders.length === 0) {
        throw new Error('No skill folders found in repository.')
    }

    return skillFolders.map(folder => ({
        name: folder.name,
        path: folder.path
    }))
}

/**
 * Fetch all files in a skill folder
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} folderPath - Path to skill folder
 * @returns {Promise<Array<{ name: string, download_url: string }>>}
 */
async function fetchSkillFiles(owner, repo, folderPath) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`
    const contents = await fetchGitHubApi(apiUrl)

    // Filter only files (not subdirectories)
    return contents
        .filter(item => item.type === 'file')
        .map(file => ({
            name: file.name,
            download_url: file.download_url
        }))
}

/**
 * Download file content from URL
 * @param {string} url - Raw file URL
 * @returns {Promise<string>}
 */
async function downloadFile(url) {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`)
    }

    return response.text()
}

/**
 * Resolve path with ~ expansion
 * @param {string} scope - 'global' or 'local'
 * @returns {string}
 */
function getSkillsPath(scope) {
    const pathTemplate = SKILLS_PATHS[scope]
    if (pathTemplate.startsWith('~')) {
        return path.join(os.homedir(), pathTemplate.slice(1))
    }
    return path.resolve(process.cwd(), pathTemplate)
}

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

/**
 * Check if file content has changed
 * @param {string} filePath - Path to existing file
 * @param {string} newContent - New content to compare
 * @returns {boolean}
 */
function hasContentChanged(filePath, newContent) {
    if (!fs.existsSync(filePath)) {
        return true
    }
    const existingContent = fs.readFileSync(filePath, 'utf8')
    return existingContent !== newContent
}

/**
 * Sync a single skill folder
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {object} skill - Skill folder info { name, path }
 * @param {string} targetDir - Target directory path
 * @returns {Promise<{ status: 'added' | 'updated' | 'unchanged', fileCount: number }>}
 */
async function syncSkillFolder(owner, repo, skill, targetDir) {
    const skillDir = path.join(targetDir, skill.name)
    const isNewSkill = !fs.existsSync(skillDir)

    // Create skill directory if it doesn't exist
    ensureDirectoryExists(skillDir)

    // Fetch all files in the skill folder
    const files = await fetchSkillFiles(owner, repo, skill.path)

    let hasChanges = false

    // Download and sync each file
    for (const file of files) {
        const targetPath = path.join(skillDir, file.name)
        const content = await downloadFile(file.download_url)

        if (hasContentChanged(targetPath, content)) {
            fs.writeFileSync(targetPath, content, 'utf8')
            hasChanges = true
        }
    }

    let status
    if (isNewSkill) {
        status = 'added'
    } else if (hasChanges) {
        status = 'updated'
    } else {
        status = 'unchanged'
    }

    return { status, fileCount: files.length }
}

/**
 * Main sync function
 */
export async function syncSkills() {
    log('🔄 Syncing Claude Code skills...')

    // Get repo URL from config or use default
    const repoUrl = config.skillsRepoUrl || DEFAULT_REPO
    const repoPath = config.skillsRepoPath || SKILLS_REPO_PATH

    // Parse GitHub URL
    const { owner, repo } = parseGitHubUrl(repoUrl)

    // Prompt for destination
    const { destination } = await inquirer.prompt([
        {
            type: 'list',
            name: 'destination',
            message: 'Where do you want to sync skills?',
            choices: [
                { name: `Global (${SKILLS_PATHS.global})`, value: 'global' },
                { name: `Local (${SKILLS_PATHS.local})`, value: 'local' },
                { name: 'Cancel', value: 'cancel' }
            ]
        }
    ])

    if (destination === 'cancel') {
        log('❌ Sync cancelled.')
        return
    }

    // Get resolved path
    const targetDir = getSkillsPath(destination)

    log(`📡 Fetching from: ${repoUrl}`)

    // Fetch skill folders list
    const skillFolders = await fetchSkillFolders(owner, repo, repoPath)

    // Ensure target directory exists
    ensureDirectoryExists(targetDir)

    log('📥 Syncing skills...')

    // Track stats
    let added = 0
    let updated = 0
    let unchanged = 0

    // Sync each skill folder
    for (const skill of skillFolders) {
        try {
            const result = await syncSkillFolder(owner, repo, skill, targetDir)

            if (result.status === 'added') {
                console.log(`  ✓ ${skill.name}/ (added - ${result.fileCount} files)`)
                added++
            } else if (result.status === 'updated') {
                console.log(`  ✓ ${skill.name}/ (updated - ${result.fileCount} files)`)
                updated++
            } else {
                console.log(`  ○ ${skill.name}/ (unchanged)`)
                unchanged++
            }
        } catch (error) {
            console.log(`  ✗ ${skill.name}/ (error: ${error.message})`)
        }
    }

    log(`✅ Done! Added: ${added} | Updated: ${updated} | Unchanged: ${unchanged}`)
}
