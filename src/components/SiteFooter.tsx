import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { socialLinks } from '../data/socialLinks'
import { getCachedRecentCommits, loadDeploymentCommit, type RecentCommit } from '../data/githubCommits'
import { deploymentCommit as deploymentCommitSha } from 'virtual:site-metadata'
import { ClockIcon, CommitIcon, EyeIcon } from './ServiceIcons'
import type { ServiceHealth, ServiceKey } from './serviceStatus'
import { useServiceStatus } from './useServiceStatus'

const isDeployedBuild = deploymentCommitSha !== 'dev'
const deploymentCommit = isDeployedBuild ? deploymentCommitSha.slice(0, 7) : 'dev'
const deploymentCommitUrl = isDeployedBuild
  ? `https://github.com/pranshuk22/pranshuk22.github.io/commit/${deploymentCommitSha}`
  : undefined
const deploymentCommitDateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})
const developmentCommitDetails = {
  summary: 'Development build · unavailable',
  additions: '+?',
  deletions: '-?',
}
const goatCounterCode = import.meta.env.VITE_GOATCOUNTER_CODE?.trim() || 'pranshuk22'
const goatCounterTotalPath = 'TOTAL'
const timeOnSiteStorageKey = 'pranshuk22-portfolio-time-on-site'
const trackedServices = [
  { key: 'siteCommit', label: 'Deployment commit' },
  { key: 'recentCommits', label: 'Recent commits' },
  { key: 'viewCount', label: 'View counter' },
  { key: 'timeOnSite', label: 'Session timer' },
] as const satisfies ReadonlyArray<{ key: ServiceKey; label: string }>

type GoatCounter = {
  allow_local?: boolean
  no_onload?: boolean
  count?: (variables: { path: string }) => void
}

type GoatCounterWindow = Window & { goatcounter?: GoatCounter }

let goatCounterScriptPromise: Promise<void> | null = null
let goatCounterPageviewSent = false

function deploymentCommitDetails(commit: RecentCommit | null) {
  if (!commit) {
    return {
      summary: 'Loading commit information…',
      additions: '+?',
      deletions: '-?',
    }
  }

  const date = commit.date
    ? deploymentCommitDateFormatter.format(new Date(commit.date))
    : 'Date unavailable'
  const additions = commit.additions?.toLocaleString() ?? '?'
  const deletions = commit.deletions?.toLocaleString() ?? '?'

  return {
    summary: `${commit.message} · ${date}`,
    additions: `+${additions}`,
    deletions: `-${deletions}`,
  }
}

type FooterTooltipPosition = {
  atEdge: boolean
  maxWidth: number | null
  right: number
}

const initialFooterTooltipPosition: FooterTooltipPosition = {
  atEdge: true,
  maxWidth: null,
  right: 0,
}

function getFooterTooltipPosition(tooltip: HTMLSpanElement | null): FooterTooltipPosition | null {
  const trigger = tooltip?.parentElement
  const footer = tooltip?.closest<HTMLElement>('.site-footer')
  if (!tooltip || !trigger || !footer) return null

  const triggerBounds = trigger.getBoundingClientRect()
  const footerBounds = footer.getBoundingClientRect()
  const tooltipBorderOffset = 24
  const tooltipRightBoundary = Math.min(
    footerBounds.right + tooltipBorderOffset,
    window.innerWidth - tooltipBorderOffset,
  )
  const tooltipMaxWidth = tooltipRightBoundary - footerBounds.left

  const tooltipWidth = Math.min(tooltip.scrollWidth, tooltipMaxWidth)
  const centeredLeft = triggerBounds.left + (triggerBounds.width / 2) - (tooltipWidth / 2)
  const centeredRight = centeredLeft + tooltipWidth
  const crossesPageEdge = centeredLeft < footerBounds.left || centeredRight > tooltipRightBoundary

  return {
    atEdge: crossesPageEdge,
    maxWidth: tooltipMaxWidth,
    right: triggerBounds.right - tooltipRightBoundary,
  }
}

function tooltipPositionsMatch(left: FooterTooltipPosition, right: FooterTooltipPosition) {
  return left.atEdge === right.atEdge
    && left.maxWidth === right.maxWidth
    && left.right === right.right
}

function footerTooltipStyle(position: FooterTooltipPosition): CSSProperties {
  return {
    maxWidth: position.maxWidth === null ? undefined : `${position.maxWidth}px`,
    right: position.atEdge ? `${position.right}px` : undefined,
  }
}

function getStoredTimeOnSite() {
  try {
    const storedTime = Number.parseInt(
      window.localStorage.getItem(timeOnSiteStorageKey) ?? '0',
      10,
    )

    return Number.isFinite(storedTime) && storedTime >= 0 ? storedTime : 0
  } catch {
    return 0
  }
}

function loadGoatCounter() {
  if (!goatCounterCode) {
    return Promise.reject(new Error('VITE_GOATCOUNTER_CODE is not configured'))
  }

  const goatCounterWindow = window as GoatCounterWindow

  if (goatCounterWindow.goatcounter?.count) {
    return Promise.resolve()
  }

  if (goatCounterScriptPromise) {
    return goatCounterScriptPromise
  }

  goatCounterWindow.goatcounter = {
    allow_local: import.meta.env.DEV,
    no_onload: true,
  }
  goatCounterScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://gc.zgo.at/count.js'
    script.dataset.goatcounter = `https://${goatCounterCode}.goatcounter.com/count`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load GoatCounter'))
    document.head.appendChild(script)
  })

  return goatCounterScriptPromise
}

async function getGoatCounterViewCount(signal: AbortSignal) {
  if (!goatCounterCode) {
    return null
  }

  const counterUrl = `https://${goatCounterCode}.goatcounter.com/counter/${goatCounterTotalPath}.json`
  const response = await fetch(counterUrl, { cache: 'no-store', signal })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { count?: string | number }
  const count = Number.parseInt(String(data.count ?? '').replaceAll(',', ''), 10)

  return Number.isFinite(count) ? count : null
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function serviceHealthLabel(health: ServiceHealth) {
  if (health === true) return 'Working'
  if (health === false) return 'Has issues'
  return 'Checking'
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z"
      />
    </svg>
  )
}

function SiteFooter() {
  const { status, setServiceHealth } = useServiceStatus()
  const [timeOnSite, setTimeOnSite] = useState(getStoredTimeOnSite)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [deploymentCommitInfo, setDeploymentCommitInfo] = useState<RecentCommit | null>(() => (
    isDeployedBuild
      ? getCachedRecentCommits().find((commit) => commit.sha === deploymentCommitSha) ?? null
      : null
  ))
  const deploymentTooltipRef = useRef<HTMLSpanElement>(null)
  const developmentTooltipRef = useRef<HTMLSpanElement>(null)
  const statusTooltipRef = useRef<HTMLSpanElement>(null)
  const [deploymentTooltipPosition, setDeploymentTooltipPosition] = useState(initialFooterTooltipPosition)
  const [developmentTooltipPosition, setDevelopmentTooltipPosition] = useState(initialFooterTooltipPosition)
  const [statusTooltipPosition, setStatusTooltipPosition] = useState(initialFooterTooltipPosition)

  const serviceValues = Object.values(status)
  const servicesHealthy = serviceValues.every((health) => health === true)
  const serviceFailed = serviceValues.some((health) => health === false)
  const serviceState = servicesHealthy ? 'nominal' : serviceFailed ? 'degraded' : 'checking'
  const deploymentTooltipDetails = deploymentCommitDetails(deploymentCommitInfo)

  useLayoutEffect(() => {
    function updateTooltipPositions() {
      const deploymentPosition = getFooterTooltipPosition(deploymentTooltipRef.current)
      const developmentPosition = getFooterTooltipPosition(developmentTooltipRef.current)
      const statusPosition = getFooterTooltipPosition(statusTooltipRef.current)

      if (deploymentPosition) {
        setDeploymentTooltipPosition((currentPosition) => (
          tooltipPositionsMatch(currentPosition, deploymentPosition)
            ? currentPosition
            : deploymentPosition
        ))
      }

      if (developmentPosition) {
        setDevelopmentTooltipPosition((currentPosition) => (
          tooltipPositionsMatch(currentPosition, developmentPosition)
            ? currentPosition
            : developmentPosition
        ))
      }

      if (statusPosition) {
        setStatusTooltipPosition((currentPosition) => (
          tooltipPositionsMatch(currentPosition, statusPosition)
            ? currentPosition
            : statusPosition
        ))
      }
    }

    updateTooltipPositions()
    window.addEventListener('resize', updateTooltipPositions)

    return () => window.removeEventListener('resize', updateTooltipPositions)
  }, [deploymentCommitInfo, status, viewCount])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeOnSite((currentTime) => currentTime + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(timeOnSiteStorageKey, String(timeOnSite))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
  }, [timeOnSite])

  useEffect(() => {
    if (!goatCounterCode) {
      return undefined
    }

    const controller = new AbortController()

    void loadGoatCounter()
      .then(() => {
        const goatCounterWindow = window as GoatCounterWindow

        if (!goatCounterPageviewSent) {
          goatCounterWindow.goatcounter?.count?.({ path: window.location.pathname })
          goatCounterPageviewSent = true
        }
      })
      .catch(() => undefined)

    void getGoatCounterViewCount(controller.signal)
      .then((count) => {
        setViewCount(count)
        setServiceHealth('viewCount', count !== null)
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setViewCount(null)
          setServiceHealth('viewCount', false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [setServiceHealth])

  useEffect(() => {
    if (!isDeployedBuild) return undefined

    let active = true

    void loadDeploymentCommit()
      .then((commit) => {
        if (active) setDeploymentCommitInfo(commit)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <span>{new Date().getFullYear()} Pranshu Kumar</span>
          <span
            className="site-footer__status-trigger"
            tabIndex={0}
            aria-describedby="service-status-tooltip"
          >
            <span
              className={`site-footer__status site-footer__status--${serviceState}`}
              role="status"
              aria-live="polite"
            >
              <span className="site-footer__status-dot" aria-hidden="true" />
              {servicesHealthy ? 'All Services Nominal' : serviceFailed ? 'Service Issue Detected' : 'Checking Services'}
            </span>
            <span
              id="service-status-tooltip"
              className={`site-footer__status-tooltip${statusTooltipPosition.atEdge ? ' site-footer__status-tooltip--edge' : ''}`}
              ref={statusTooltipRef}
              role="tooltip"
              style={footerTooltipStyle(statusTooltipPosition)}
            >
              <span className="site-footer__status-tooltip-title">Tracked Services</span>
              <span className="site-footer__status-list" role="list">
                {trackedServices.map(({ key, label }) => {
                  const health = status[key]

                  return (
                    <span className="site-footer__status-item" role="listitem" key={key}>
                      <span>{label}</span>
                      <span className={`site-footer__service-health site-footer__service-health--${health === true ? 'working' : health === false ? 'issues' : 'checking'}`}>
                        <span className="site-footer__service-health-dot" aria-hidden="true" />
                        {serviceHealthLabel(health)}
                      </span>
                      {key === 'viewCount' && health === false && (
                        <span className="site-footer__service-note">
                          ad blocker may affect availability
                        </span>
                      )}
                    </span>
                  )
                })}
              </span>
            </span>
          </span>
        </div>

        <div className="site-footer__details">
          <span
            className="site-footer__metric site-footer__tooltip"
            data-tooltip="How long you've been on my site"
          >
            <span className="site-footer__icon site-footer__clock-icon" aria-hidden="true"><ClockIcon /></span>
            <span className="sr-only">Time on site:</span> {formatDuration(timeOnSite)}
          </span>
          <span
            className="site-footer__metric site-footer__tooltip"
            data-tooltip="Number of views on my site"
          >
            <span className="site-footer__icon" aria-hidden="true"><EyeIcon /></span>
            <span className="sr-only">Site views:</span> {viewCount?.toLocaleString() ?? '?'} views
          </span>
          {deploymentCommitUrl ? (
            <a
              className="site-footer__commit site-footer__tooltip site-footer__tooltip--detail"
              href={deploymentCommitUrl}
              target="_blank"
              rel="noreferrer"
              data-tooltip="Current deployment commit (click to view)"
            >
              <span className="site-footer__icon" aria-hidden="true"><CommitIcon /></span>
              <span className="sr-only">Deployment commit:</span> {deploymentCommit}
              <span
                className={`site-footer__tooltip-detail${deploymentTooltipPosition.atEdge ? ' site-footer__tooltip-detail--edge' : ''}`}
                ref={deploymentTooltipRef}
                aria-hidden="true"
                style={footerTooltipStyle(deploymentTooltipPosition)}
              >
                <span>Current deployment commit (click to view)</span>
                <span>
                  {deploymentTooltipDetails.summary} ·{' '}
                  <span className="site-footer__tooltip-additions">{deploymentTooltipDetails.additions}</span>
                  {' / '}
                  <span className="site-footer__tooltip-deletions">{deploymentTooltipDetails.deletions}</span>
                </span>
              </span>
            </a>
          ) : (
            <span
              className="site-footer__commit site-footer__tooltip site-footer__tooltip--detail"
              data-tooltip="Development environment"
            >
              <span className="site-footer__icon" aria-hidden="true"><CommitIcon /></span>
              <span className="sr-only">Deployment commit:</span> {deploymentCommit}
              <span
                className={`site-footer__tooltip-detail${developmentTooltipPosition.atEdge ? ' site-footer__tooltip-detail--edge' : ''}`}
                ref={developmentTooltipRef}
                aria-hidden="true"
                style={footerTooltipStyle(developmentTooltipPosition)}
              >
                <span>Development environment</span>
                <span>
                  {developmentCommitDetails.summary} ·{' '}
                  <span className="site-footer__tooltip-additions">{developmentCommitDetails.additions}</span>
                  {' / '}
                  <span className="site-footer__tooltip-deletions">{developmentCommitDetails.deletions}</span>
                </span>
              </span>
            </span>
          )}
          <a
            className="site-footer__social-link"
            href={socialLinks.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <GithubIcon />
          </a>
          <a
            className="site-footer__social-link"
            href={socialLinks.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
          >
            <LinkedinIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
