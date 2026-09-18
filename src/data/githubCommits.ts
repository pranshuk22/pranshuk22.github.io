import { deploymentCommit } from 'virtual:site-metadata'

export type RecentCommit = {
  sha: string
  message: string
  repository: string
  repositoryFullName: string
  date: string
  url: string
  additions: number | null
  deletions: number | null
}

type GitHubCommit = {
  sha: string
  html_url: string
  commit: {
    message: string
    committer: { date: string } | null
  }
  stats?: {
    additions: number
    deletions: number
  }
}

type GitHubCommitSearchResponse = {
  items?: Array<GitHubCommit & {
    repository: { full_name: string }
  }>
}

type RecentCommitsCache = {
  cachedAt: number
  commits: RecentCommit[]
}

const githubUser = 'pranshuk22'
const siteRepository = `${githubUser}/${githubUser}.github.io`
const recentCommitsCacheKey = 'pranshuk22-recent-github-commits'
const githubRetryAfterKey = 'pranshuk22-github-api-retry-after'
const recentCommitsCacheLifetime = 60 * 60 * 1000
const githubFailureCooldown = 15 * 60 * 1000
const recentCommitsEndpoint = `https://api.github.com/search/commits?${new URLSearchParams({
  q: `author:${githubUser}`,
  sort: 'committer-date',
  order: 'desc',
  per_page: '5',
})}`
const hasDeploymentCommit = /^[0-9a-f]{7,40}$/i.test(deploymentCommit)

let recentCommitsRequest: Promise<RecentCommit[]> | null = null
let deploymentCommitRequest: Promise<RecentCommit> | null = null

function isRecentCommit(value: unknown): value is RecentCommit {
  if (!value || typeof value !== 'object') return false

  const commit = value as Record<string, unknown>
  const hasStrings = ['sha', 'message', 'repository', 'repositoryFullName', 'date', 'url']
    .every((key) => typeof commit[key] === 'string')
  const hasStats = ['additions', 'deletions']
    .every((key) => commit[key] === null || typeof commit[key] === 'number')

  return hasStrings && hasStats
}

function readCache() {
  try {
    const value = window.localStorage.getItem(recentCommitsCacheKey)
    if (!value) return null

    const cache = JSON.parse(value) as Partial<RecentCommitsCache>
    if (
      typeof cache.cachedAt !== 'number'
      || !Array.isArray(cache.commits)
      || !cache.commits.every(isRecentCommit)
    ) {
      return null
    }

    return cache as RecentCommitsCache
  } catch {
    return null
  }
}

function writeCache(commits: RecentCommit[]) {
  try {
    window.localStorage.setItem(recentCommitsCacheKey, JSON.stringify({
      cachedAt: Date.now(),
      commits,
    }))
  } catch {
    // The live request still works when storage is unavailable.
  }
}

function readGitHubRetryAfter() {
  try {
    const retryAfter = Number.parseInt(
      window.localStorage.getItem(githubRetryAfterKey) ?? '0',
      10,
    )
    return Number.isFinite(retryAfter) ? retryAfter : 0
  } catch {
    return 0
  }
}

function writeGitHubRetryAfter(retryAfter: number) {
  try {
    window.localStorage.setItem(githubRetryAfterKey, String(retryAfter))
  } catch {
    // The in-memory request guard still prevents duplicate concurrent calls.
  }
}

function getRateLimitReset(response: Response) {
  const resetAt = Number.parseInt(response.headers.get('X-RateLimit-Reset') ?? '', 10) * 1000
  return Number.isFinite(resetAt) && resetAt > Date.now()
    ? resetAt
    : Date.now() + githubFailureCooldown
}

export function getCachedRecentCommits() {
  return readCache()?.commits ?? []
}

function toRecentCommit(commit: GitHubCommit, repository: string): RecentCommit {
  return {
    sha: commit.sha,
    message: commit.commit.message.split('\n')[0],
    repository: repository.replace(`${githubUser}/`, ''),
    repositoryFullName: repository,
    date: commit.commit.committer?.date ?? '',
    url: commit.html_url,
    additions: commit.stats?.additions ?? null,
    deletions: commit.stats?.deletions ?? null,
  }
}

function getCommitKey(commit: RecentCommit) {
  return `${commit.repositoryFullName}:${commit.sha}`
}

function hasCompleteStats(commit: RecentCommit) {
  return commit.additions !== null && commit.deletions !== null
}

function reuseCachedStats(
  commit: RecentCommit,
  cachedCommits: Map<string, RecentCommit>,
) {
  const cachedCommit = cachedCommits.get(getCommitKey(commit))

  return cachedCommit && hasCompleteStats(cachedCommit)
    ? {
        ...commit,
        additions: cachedCommit.additions,
        deletions: cachedCommit.deletions,
      }
    : commit
}

function githubRequest<T>(url: string, signal: AbortSignal) {
  if (readGitHubRetryAfter() > Date.now()) {
    return Promise.reject(new Error('GitHub requests are cooling down'))
  }

  return fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal,
  }).then(async (response) => {
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        writeGitHubRetryAfter(getRateLimitReset(response))
      }
      throw new Error(`GitHub returned ${response.status}`)
    }

    return (await response.json()) as T
  })
}

function newestFirst(left: RecentCommit, right: RecentCommit) {
  const leftDate = Date.parse(left.date)
  const rightDate = Date.parse(right.date)

  return (Number.isNaN(rightDate) ? 0 : rightDate)
    - (Number.isNaN(leftDate) ? 0 : leftDate)
}

function getCommitEndpoint(commit: RecentCommit) {
  const repository = commit.repositoryFullName
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')

  return `https://api.github.com/repos/${repository}/commits/${commit.sha}`
}

export function loadDeploymentCommit() {
  if (!hasDeploymentCommit) {
    return Promise.reject(new Error('No deployment commit is available'))
  }

  const cachedCommit = getCachedRecentCommits().find((commit) => (
    commit.repositoryFullName === siteRepository
      && commit.sha === deploymentCommit
      && hasCompleteStats(commit)
  ))

  if (cachedCommit) return Promise.resolve(cachedCommit)

  if (!deploymentCommitRequest) {
    const signal = AbortSignal.timeout(8_000)
    deploymentCommitRequest = githubRequest<GitHubCommit>(
      `https://api.github.com/repos/${siteRepository}/commits/${deploymentCommit}`,
      signal,
    )
      .then((commit) => toRecentCommit(commit, siteRepository))
      .finally(() => {
        deploymentCommitRequest = null
      })
  }

  return deploymentCommitRequest
}

async function fetchRecentCommits() {
  const signal = AbortSignal.timeout(8_000)
  const cachedCommits = getCachedRecentCommits()
  const cachedCommitsByKey = new Map(
    cachedCommits.map((commit) => [getCommitKey(commit), commit]),
  )
  const searchRequest = githubRequest<GitHubCommitSearchResponse>(recentCommitsEndpoint, signal)
  const deploymentRequest = hasDeploymentCommit
    ? loadDeploymentCommit()
    : Promise.resolve(null)

  const [searchResult, deploymentResult] = await Promise.allSettled([
    searchRequest,
    deploymentRequest,
  ])
  const commits = searchResult.status === 'fulfilled'
    ? (searchResult.value.items ?? []).map((item) => (
        reuseCachedStats(
          toRecentCommit(item, item.repository.full_name),
          cachedCommitsByKey,
        )
      ))
    : cachedCommits

  if (deploymentResult.status === 'fulfilled' && deploymentResult.value) {
    commits.push(deploymentResult.value)
  }

  const uniqueCommits = [...new Map(
    commits.map((commit) => [getCommitKey(commit), commit]),
  ).values()]
    .sort(newestFirst)
    .slice(0, 5)

  if (uniqueCommits.length === 0) {
    throw new Error('GitHub did not return any commits')
  }

  const statsSignal = AbortSignal.timeout(8_000)
  const commitsWithStats = await Promise.all(uniqueCommits.map(async (commit) => {
    if (hasCompleteStats(commit)) return commit

    try {
      const detailedCommit = await githubRequest<GitHubCommit>(
        getCommitEndpoint(commit),
        statsSignal,
      )
      return toRecentCommit(detailedCommit, commit.repositoryFullName)
    } catch {
      return commit
    }
  }))

  writeCache(commitsWithStats)
  return commitsWithStats
}

export function loadRecentCommits({ forceRefresh = false }: { forceRefresh?: boolean } = {}) {
  const cache = readCache()
  if (!forceRefresh && cache && Date.now() - cache.cachedAt < recentCommitsCacheLifetime) {
    return Promise.resolve(cache.commits)
  }

  if (readGitHubRetryAfter() > Date.now()) {
    return cache?.commits.length
      ? Promise.resolve(cache.commits)
      : Promise.reject(new Error('GitHub requests are cooling down'))
  }

  if (!recentCommitsRequest) {
    recentCommitsRequest = fetchRecentCommits()
      .finally(() => {
        recentCommitsRequest = null
      })
  }

  return recentCommitsRequest
}
