import inquirer from 'inquirer'
import { spawn, sync as spawnSync } from 'cross-spawn'
import { scripts } from '../scripts.js'
import { log, closeTerminal, getStoreFlag } from '../utils.js'
import { config } from '../config.js'

const STAGING_LABEL = 'staging'

/**
 * Run a command capturing its output.
 * No shell: args are passed as an array so branch names are never interpolated.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {{ code: number, stdout: string, stderr: string }}
 */
function exec(cmd, args) {
    const res = spawnSync(cmd, args, { encoding: 'utf-8' })

    return {
        code: res.status ?? 1,
        stdout: (res.stdout || '').trim(),
        stderr: (res.stderr || '').trim()
    }
}

/**
 * Resolve the staging theme flag from shopirun.config.json.
 * The theme key is matched case-insensitively ("staging", "Staging", "STAGING").
 * Returns an empty string when there is no staging theme configured, so the
 * Shopify CLI prompts with its own theme list.
 * @returns {string}
 */
function getStagingThemeFlag() {
    const themes = config.themes || {}
    const stagingKey = Object.keys(themes).find(key => key.toLowerCase() === STAGING_LABEL)

    if (!stagingKey) {
        log(`⚠️  No "staging" theme found in shopirun.config.json. The Shopify CLI will ask you which theme to use.`)
        return ''
    }

    log(`🎯 Staging theme: ${stagingKey} (${themes[stagingKey]})`)

    return `--theme=${themes[stagingKey]}`
}

/**
 * Make sure git, gh and the working tree are all in a usable state.
 * @throws {Error} when any precondition is not met
 */
function assertGitAndGhReady() {
    if (exec('git', ['rev-parse', '--is-inside-work-tree']).code !== 0) {
        throw new Error('This is not a git repository. Run the command from your theme repository, or choose the "current working tree" option.')
    }

    if (exec('gh', ['--version']).code !== 0) {
        throw new Error('GitHub CLI (gh) is not installed. Install it with "brew install gh" (or see https://cli.github.com) to deploy staging PRs.')
    }

    if (exec('gh', ['auth', 'status']).code !== 0) {
        throw new Error('GitHub CLI is not authenticated. Run "gh auth login" and try again.')
    }

    const status = exec('git', ['status', '--porcelain'])
    if (!!status.stdout) {
        console.log('')
        console.log('❌ You have uncommitted changes. Commit or stash them before merging the staging PRs:')
        console.log('')
        console.log(exec('git', ['status', '--short']).stdout)
        console.log('')
        throw new Error('Working tree is not clean.')
    }
}

/**
 * Fetch the open PRs labeled `staging`, skipping the ones coming from forks.
 * @returns {Array<{ number: number, title: string, headRefName: string }>}
 */
function getStagingPrs() {
    const res = exec('gh', [
        'pr', 'list',
        '--state', 'open',
        '--label', STAGING_LABEL,
        '--json', 'number,title,headRefName,isCrossRepository'
    ])

    if (res.code !== 0) {
        throw new Error(`Could not list pull requests: ${res.stderr || 'unknown gh error'}`)
    }

    let prs = []
    try {
        prs = JSON.parse(res.stdout || '[]')
    } catch (error) {
        throw new Error(`Could not parse the pull request list: ${error.message}`)
    }

    const forks = prs.filter(pr => pr.isCrossRepository)
    forks.forEach(pr => console.log(`  ⚠️  Skipping #${pr.number} ${pr.title} (comes from a fork)`))

    return prs.filter(pr => !pr.isCrossRepository)
}

/**
 * Resolve the repository default branch.
 * @returns {string}
 */
function getDefaultBranch() {
    const fromGh = exec('gh', ['repo', 'view', '--json', 'defaultBranchRef', '-q', '.defaultBranchRef.name'])
    if (fromGh.code === 0 && !!fromGh.stdout) return fromGh.stdout

    // Only set in repos where origin/HEAD was resolved (fresh clone or `git remote set-head origin -a`)
    const fromGit = exec('git', ['symbolic-ref', 'refs/remotes/origin/HEAD'])
    if (fromGit.code === 0 && !!fromGit.stdout) return fromGit.stdout.replace('refs/remotes/origin/', '')

    throw new Error('Could not determine the repository default branch. Run "git remote set-head origin -a" and try again.')
}

/**
 * Build an unused local branch name for today's integration branch.
 * @returns {string}
 */
function getIntegrationBranchName() {
    // Built explicitly instead of reusing getDate(): its locale formatting drops
    // the zero padding on some ICU builds ("12/8" instead of "12/08")
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const base = `staging-deploy-${day}-${month}`

    let name = base
    let suffix = 1
    while (exec('git', ['rev-parse', '--verify', '--quiet', name]).code === 0) {
        suffix++
        name = `${base}-${suffix}`
    }

    return name
}

/**
 * Create an integration branch off the default branch and merge every open PR
 * labeled `staging` into it.
 * @returns {Promise<{ integrationBranch: string, originalBranch: string, prs: Array<object> }|null>}
 * null when the user cancels.
 */
async function integrateStagingPrs() {
    assertGitAndGhReady()

    const originalBranch = exec('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout

    log(`🔎 Looking for open PRs labeled "${STAGING_LABEL}"...`)

    const prs = getStagingPrs()

    if (prs.length === 0) {
        throw new Error(`No open PRs labeled "${STAGING_LABEL}" were found. Run the command again and choose the "current working tree" option to deploy what you have locally.`)
    }

    console.log('')
    console.log(`Found ${prs.length} PR${prs.length > 1 ? 's' : ''} labeled "${STAGING_LABEL}":`)
    prs.forEach(pr => console.log(`  #${pr.number} ${pr.title} (${pr.headRefName})`))
    console.log('')

    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Create an integration branch and merge them?',
            default: true
        }
    ])

    if (!confirmed) return null

    log('📡 Fetching branches from origin...')

    const fetched = exec('git', ['fetch', 'origin', '--prune'])
    if (fetched.code !== 0) {
        throw new Error(`git fetch failed: ${fetched.stderr || 'unknown error'}`)
    }

    const defaultBranch = getDefaultBranch()
    const integrationBranch = getIntegrationBranchName()

    const created = exec('git', ['checkout', '-b', integrationBranch, `origin/${defaultBranch}`])
    if (created.code !== 0) {
        throw new Error(`Could not create branch ${integrationBranch}: ${created.stderr || 'unknown error'}`)
    }

    log(`🌱 Created ${integrationBranch} from origin/${defaultBranch}`)

    for (const pr of prs) {
        const remoteRef = `origin/${pr.headRefName}`

        if (exec('git', ['rev-parse', '--verify', '--quiet', remoteRef]).code !== 0) {
            exec('git', ['checkout', originalBranch])
            throw new Error(`Branch ${remoteRef} does not exist on origin (PR #${pr.number}). The integration branch ${integrationBranch} was kept for inspection.`)
        }

        const merged = exec('git', ['merge', '--no-edit', remoteRef])

        if (merged.code !== 0) {
            const conflicts = exec('git', ['diff', '--name-only', '--diff-filter=U']).stdout

            exec('git', ['merge', '--abort'])
            exec('git', ['checkout', originalBranch])

            console.log('')
            console.log(`❌ Merge conflict while merging PR #${pr.number} ${pr.title} (${pr.headRefName})`)
            if (!!conflicts) {
                console.log('')
                console.log('Conflicting files:')
                conflicts.split('\n').forEach(file => console.log(`  • ${file}`))
            } else if (!!merged.stderr) {
                console.log('')
                console.log(merged.stderr)
            }
            console.log('')
            console.log(`Nothing was deployed. Run "git checkout ${integrationBranch}" to resolve it manually.`)
            console.log('')

            throw new Error(`Could not merge PR #${pr.number}.`)
        }

        console.log(`  ✓ #${pr.number} ${pr.title} (${pr.headRefName})`)
    }

    console.log('')
    console.log(`📦 Integration branch: ${integrationBranch} (from ${defaultBranch})`)
    console.log('')

    return { integrationBranch, originalBranch, prs }
}

async function runDeployStaging() {
    const themeFlag = getStagingThemeFlag()
    const storeFlag = await getStoreFlag()

    const { scope } = await inquirer.prompt([
        {
            type: 'list',
            name: 'scope',
            message: 'What do you want to deploy?',
            choices: [
                { name: 'Current working tree', value: 'current' },
                { name: `All open PRs labeled "${STAGING_LABEL}"`, value: 'prs' },
                { name: 'Cancel', value: 'cancel' }
            ]
        }
    ])

    if (scope === 'cancel') {
        log('❌ Deploy cancelled.')
        return
    }

    const { jsons } = await inquirer.prompt([
        {
            type: 'list',
            name: 'jsons',
            message: 'What files do you want to deploy?',
            choices: [
                { name: 'Everything', value: 'deploy-all' },
                { name: 'Without JSONs', value: 'deploy-without-jsons' },
                { name: 'Cancel', value: 'cancel' }
            ]
        }
    ])

    if (jsons === 'cancel') {
        log('❌ Deploy cancelled.')
        return
    }

    let integration = null
    if (scope === 'prs') {
        integration = await integrateStagingPrs()

        if (!integration) {
            log('❌ Deploy cancelled.')
            return
        }
    }

    log(`🚀 Deploying to staging...`)

    // Reuse the existing deploy scripts so the Shopify flags stay in a single place
    const flags = [storeFlag, themeFlag].filter(Boolean)
    const [cmd, args] = scripts[jsons](...flags)

    // Wait for the push to finish before restoring the branch and exiting
    const code = await new Promise((resolve) => {
        const child = spawn(cmd, args, { stdio: 'inherit', shell: true })
        child.on('close', resolve)
    })

    if (!!integration) {
        exec('git', ['checkout', integration.originalBranch])
        console.log('')
        console.log(`↩️  Back on ${integration.originalBranch}. The integration branch ${integration.integrationBranch} was kept locally.`)
    }

    // clear = false so the Shopify push output (preview URL) stays visible
    closeTerminal(code ?? 0, '', false)
}

/**
 * Deploy to the staging theme, optionally integrating every open PR labeled `staging` first.
 * Owns its own exit so the push output and any error details are not cleared from the screen.
 */
export async function deployStaging() {
    try {
        await runDeployStaging()
    } catch (error) {
        // Ctrl+C during a prompt: exit like the rest of the CLI does
        if (error.name === 'ExitPromptError') {
            console.log('\n\n👋 Goodbye!\n')
            process.exit(0)
        }

        closeTerminal(1, `❌ ${error.message}\n`, false)
    }
}
