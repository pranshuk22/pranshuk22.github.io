export type GitHubContributionDay = {
  date: string
  count: number
  level: number
}

export type GitHubContributions = {
  total: number
  contributions: GitHubContributionDay[]
}

type GitHubContributionsResponse = {
  total?: Record<string, unknown>
  contributions?: unknown[]
}

const githubUser = 'pranshuk22'
const contributionsEndpoint = `https://github-contributions-api.jogruber.de/v4/${githubUser}?y=last`
const contributionsCacheKey = 'pranshuk22-github-contributions'
const contributionsCacheLifetime = 60 * 60 * 1000

type GitHubContributionsCache = {
  cachedAt: number
  data: GitHubContributions
}

let contributionsRequest: Promise<GitHubContributions> | null = null

function isContributionDay(value: unknown): value is GitHubContributionDay {
  if (!value || typeof value !== 'object') return false

  const day = value as Record<string, unknown>
  return typeof day.date === 'string'
    && typeof day.count === 'number'
    && Number.isFinite(day.count)
    && typeof day.level === 'number'
    && Number.isFinite(day.level)
}

function isGitHubContributions(value: unknown): value is GitHubContributions {
  if (!value || typeof value !== 'object') return false

  const data = value as Record<string, unknown>
  return typeof data.total === 'number'
    && Number.isFinite(data.total)
    && Array.isArray(data.contributions)
    && data.contributions.every(isContributionDay)
}

function readCache() {
  try {
    const cached = window.localStorage.getItem(contributionsCacheKey)
    if (!cached) return null

    const cache = JSON.parse(cached) as Partial<GitHubContributionsCache>
    return typeof cache.cachedAt === 'number' && isGitHubContributions(cache.data)
      ? cache as GitHubContributionsCache
      : null
  } catch {
    return null
  }
}

function writeCache(data: GitHubContributions) {
  try {
    window.localStorage.setItem(contributionsCacheKey, JSON.stringify({
      cachedAt: Date.now(),
      data,
    }))
  } catch {
    // The calendar can still use the live response when storage is unavailable.
  }
}

function normalizeResponse(response: GitHubContributionsResponse): GitHubContributions {
  const contributions = (response.contributions ?? [])
    .filter(isContributionDay)
    .map((day) => ({
      date: day.date,
      count: Math.max(0, day.count),
      level: Math.min(4, Math.max(0, Math.round(day.level))),
    }))
    .sort((left, right) => left.date.localeCompare(right.date))

  if (contributions.length === 0) {
    throw new Error('The contributions API did not return any calendar days')
  }

  const reportedTotal = response.total?.lastYear
  const total = typeof reportedTotal === 'number' && Number.isFinite(reportedTotal)
    ? reportedTotal
    : contributions.reduce((sum, day) => sum + day.count, 0)

  return { total, contributions }
}

export function getCachedGitHubContributions() {
  return readCache()?.data ?? null
}

async function fetchGitHubContributions() {
  const response = await fetch(contributionsEndpoint, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) {
    throw new Error(`Contributions API returned ${response.status}`)
  }

  const data = normalizeResponse((await response.json()) as GitHubContributionsResponse)
  writeCache(data)
  return data
}

export function loadGitHubContributions({ forceRefresh = false }: { forceRefresh?: boolean } = {}) {
  const cache = readCache()
  if (!forceRefresh && cache && Date.now() - cache.cachedAt < contributionsCacheLifetime) {
    return Promise.resolve(cache.data)
  }

  if (!contributionsRequest) {
    contributionsRequest = fetchGitHubContributions()
      .finally(() => {
        contributionsRequest = null
      })
  }

  return contributionsRequest
}
