import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  getCachedGitHubContributions,
  loadGitHubContributions,
  type GitHubContributionDay,
  type GitHubContributions,
} from '../data/githubContributions'

const githubProfileUrl = 'https://github.com/pranshuk22'
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'long',
  timeZone: 'UTC',
})

type CalendarCell = GitHubContributionDay | null
type CalendarStyle = CSSProperties & { '--contribution-week-count': number }

function parseContributionDate(date: string) {
  return new Date(`${date}T00:00:00Z`)
}

function buildCalendar(contributions: GitHubContributionDay[]) {
  if (contributions.length === 0) {
    return { weeks: [] as CalendarCell[][], months: [] as Array<{ label: string; week: number }> }
  }

  const firstDay = parseContributionDate(contributions[0].date).getUTCDay()
  const lastDay = parseContributionDate(contributions.at(-1)!.date).getUTCDay()
  const cells: CalendarCell[] = [
    ...Array.from<CalendarCell>({ length: firstDay }).fill(null),
    ...contributions,
    ...Array.from<CalendarCell>({ length: 6 - lastDay }).fill(null),
  ]
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) => (
    cells.slice(index * 7, (index + 1) * 7)
  ))
  const months: Array<{ label: string; week: number }> = []
  let previousMonth = -1

  weeks.forEach((week, weekIndex) => {
    week.forEach((day) => {
      if (!day) return

      const date = parseContributionDate(day.date)
      const month = date.getUTCMonth()
      if (month === previousMonth) return

      months.push({ label: monthFormatter.format(date), week: weekIndex + 1 })
      previousMonth = month
    })
  })

  return { weeks, months }
}

function contributionLabel(day: GitHubContributionDay) {
  const contributionText = day.count === 1 ? 'contribution' : 'contributions'
  return `${day.count} ${contributionText} on ${dateFormatter.format(parseContributionDate(day.date))}`
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.28-.36 6.72-1.61 6.72-7.25A5.65 5.65 0 0 0 19.22 3.3 5.4 5.4 0 0 0 19.08 1S17.9.65 15 2.48a13.38 13.38 0 0 0-7 0C5.1.65 3.92 1 3.92 1a5.4 5.4 0 0 0-.14 2.3A5.65 5.65 0 0 0 2.28 7.25c0 5.63 3.44 6.88 6.72 7.25A4.8 4.8 0 0 0 8 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function getLastSixMonths(data: GitHubContributions): GitHubContributions {
  const lastContribution = data.contributions.at(-1)
  if (!lastContribution) return { total: 0, contributions: [] }

  const startDate = parseContributionDate(lastContribution.date)
  const originalDay = startDate.getUTCDate()
  startDate.setUTCDate(1)
  startDate.setUTCMonth(startDate.getUTCMonth() - 6)
  const daysInStartMonth = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0),
  ).getUTCDate()
  startDate.setUTCDate(Math.min(originalDay, daysInStartMonth))
  const startDateString = startDate.toISOString().slice(0, 10)
  const contributions = data.contributions.filter((day) => day.date >= startDateString)

  return {
    total: contributions.reduce((sum, day) => sum + day.count, 0),
    contributions,
  }
}

function ContributionCalendar({ data }: { data: GitHubContributions }) {
  const areaRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tooltipCellRef = useRef<HTMLSpanElement | null>(null)
  const [tooltip, setTooltip] = useState<{
    date: string
    label: string
    left: number
    top: number
  } | null>(null)
  const tooltipDate = tooltip?.date
  const { weeks, months } = useMemo(
    () => buildCalendar(data.contributions),
    [data.contributions],
  )
  const firstCellIndex = useMemo(
    () => weeks.flat().findIndex((day) => day !== null),
    [weeks],
  )
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null)
  const selectedCellIndex = activeCellIndex !== null
    && weeks[Math.floor(activeCellIndex / 7)]?.[activeCellIndex % 7]
    ? activeCellIndex
    : firstCellIndex
  const calendarStyle: CalendarStyle = { '--contribution-week-count': weeks.length }

  function showTooltip(cell: HTMLSpanElement, day: GitHubContributionDay) {
    tooltipCellRef.current = cell
    const cellBounds = cell.getBoundingClientRect()

    setTooltip({
      date: day.date,
      label: contributionLabel(day),
      left: cellBounds.left + (cellBounds.width / 2),
      top: cellBounds.top,
    })
  }

  useEffect(() => {
    if (!tooltipDate) return

    function updateTooltipPosition() {
      const cell = tooltipCellRef.current
      if (!cell) return

      const cellBounds = cell.getBoundingClientRect()
      setTooltip((currentTooltip) => currentTooltip
        ? {
          ...currentTooltip,
          left: cellBounds.left + (cellBounds.width / 2),
          top: cellBounds.top,
        }
        : null)
    }

    window.addEventListener('resize', updateTooltipPosition)
    window.addEventListener('scroll', updateTooltipPosition, true)

    return () => {
      window.removeEventListener('resize', updateTooltipPosition)
      window.removeEventListener('scroll', updateTooltipPosition, true)
    }
  }, [tooltipDate])

  function focusCell(index: number) {
    const cell = cellRefs.current[index]
    if (!cell) return

    setActiveCellIndex(index)
    cell.focus()
  }

  function findAdjacentCell(index: number, weekDelta: number, dayDelta: number) {
    let weekIndex = Math.floor(index / 7) + weekDelta
    let dayIndex = index % 7 + dayDelta

    while (
      weekIndex >= 0
      && weekIndex < weeks.length
      && dayIndex >= 0
      && dayIndex < 7
    ) {
      if (weeks[weekIndex]?.[dayIndex]) return weekIndex * 7 + dayIndex
      weekIndex += weekDelta
      dayIndex += dayDelta
    }

    return index
  }

  function handleCellKeyDown(event: ReactKeyboardEvent<HTMLSpanElement>, index: number) {
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const [weekDelta, dayDelta] = movement[event.key] ?? []
    if (weekDelta === undefined || dayDelta === undefined) return

    event.preventDefault()
    focusCell(findAdjacentCell(index, weekDelta, dayDelta))
  }

  return (
    <div className="contribution-calendar__area" ref={areaRef}>
      <div className="contribution-calendar">
        <div className="contribution-calendar__day-labels" aria-hidden="true">
          <span style={{ gridRow: 2 }}>Mon</span>
          <span style={{ gridRow: 4 }}>Wed</span>
          <span style={{ gridRow: 6 }}>Fri</span>
        </div>

        <div className="contribution-calendar__viewport">
          <div className="contribution-calendar__canvas" style={calendarStyle}>
            <div className="contribution-calendar__months" aria-hidden="true">
              {months.map((month) => (
                <span style={{ gridColumn: month.week }} key={`${month.label}-${month.week}`}>
                  {month.label}
                </span>
              ))}
            </div>

            <div
              className="contribution-calendar__grid"
              role="grid"
              aria-label={`${data.total.toLocaleString()} GitHub contributions in the past 6 months`}
            >
              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div
                  role="row"
                  style={{ display: 'contents' }}
                  key={`day-${dayIndex}`}
                >
                  {weeks.map((week, weekIndex) => {
                    const day = week[dayIndex]
                    const cellIndex = (weekIndex * 7) + dayIndex
                    const cellStyle = {
                      gridColumn: weekIndex + 1,
                      gridRow: dayIndex + 1,
                    }

                    return day ? (
                      <span
                        ref={(cell) => { cellRefs.current[cellIndex] = cell }}
                        className={`contribution-calendar__cell contribution-calendar__cell--level-${day.level}`}
                        role="gridcell"
                        tabIndex={selectedCellIndex === cellIndex ? 0 : -1}
                        aria-label={contributionLabel(day)}
                        aria-describedby={tooltip?.date === day.date ? 'contribution-calendar-tooltip' : undefined}
                        style={cellStyle}
                        onFocus={(event) => {
                          setActiveCellIndex(cellIndex)
                          showTooltip(event.currentTarget, day)
                        }}
                        onBlur={(event) => {
                          if (!(event.relatedTarget instanceof Node) || !areaRef.current?.contains(event.relatedTarget)) {
                            tooltipCellRef.current = null
                            setTooltip(null)
                          }
                        }}
                        onKeyDown={(event) => handleCellKeyDown(event, cellIndex)}
                        onPointerEnter={(event) => showTooltip(event.currentTarget, day)}
                        onPointerLeave={(event) => {
                          if (document.activeElement !== event.currentTarget) {
                            tooltipCellRef.current = null
                            setTooltip(null)
                          }
                        }}
                        key={day.date}
                      />
                    ) : (
                      <span
                        className="contribution-calendar__cell contribution-calendar__cell--empty"
                        aria-hidden="true"
                        style={cellStyle}
                        key={`empty-${weekIndex}-${dayIndex}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="contribution-calendar__footer">
        <div className="contribution-calendar__legend" aria-label="Contribution intensity from less to more">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              className={`contribution-calendar__cell contribution-calendar__cell--level-${level}`}
              aria-hidden="true"
              key={level}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {tooltip && (
        <span
          className="contribution-calendar__tooltip"
          id="contribution-calendar-tooltip"
          role="tooltip"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.label}
        </span>
      )}
    </div>
  )
}

function GitHubContributionsCard() {
  const [data, setData] = useState<GitHubContributions | null>(getCachedGitHubContributions)
  const [loading, setLoading] = useState(data === null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let active = true

    void loadGitHubContributions({ forceRefresh: true })
      .then((contributions) => {
        if (!active) return

        setData(contributions)
        setUnavailable(false)
      })
      .catch(() => {
        if (active) setUnavailable(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const sixMonthData = useMemo(() => (data ? getLastSixMonths(data) : null), [data])

  return (
    <article className="contact-card contribution-card contact-card--contributions">
      <div className="contribution-card__header">
        <a
          className="contribution-card__github-link"
          href={githubProfileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="View my GitHub profile"
        >
          <GitHubIcon />
        </a>
        <div className="contribution-card__title">
          <h3>
            {sixMonthData
              ? `${sixMonthData.total.toLocaleString()} contributions in the past 6 months`
              : 'Contributions in the past 6 months'}
          </h3>
        </div>
      </div>

      {sixMonthData ? (
        <ContributionCalendar data={sixMonthData} />
      ) : (
        <div className="contribution-calendar__message" role="status" aria-live="polite">
          {loading && !unavailable
            ? 'Fetching contribution activity…'
            : 'Contribution activity is temporarily unavailable.'}
        </div>
      )}
    </article>
  )
}

export default GitHubContributionsCard
