import { useEffect, useState } from 'react'
import { socialLinks } from '../data/socialLinks'
import { getCachedRecentCommits, loadRecentCommits } from '../data/githubCommits'
import ContactForm from './ContactForm'
import GitHubContributionsCard from './GitHubContributionsSection'
import { PulseIcon, TrophyIcon } from './ServiceIcons'

function SendIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="contact-card__linkedin-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="contact-card__mail-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function ExtraInfoSection() {
  const [recentCommits, setRecentCommits] = useState(getCachedRecentCommits)
  const [commitsLoading, setCommitsLoading] = useState(recentCommits.length === 0)
  const [commitsUnavailable, setCommitsUnavailable] = useState(false)

  useEffect(() => {
    let active = true

    void loadRecentCommits({ forceRefresh: true })
      .then((commits) => {
        if (!active) return

        setRecentCommits(commits)
        setCommitsUnavailable(commits.length === 0)
      })
      .catch(() => {
        if (!active) return

        setCommitsUnavailable(true)
      })
      .finally(() => {
        if (active) setCommitsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="content-section extra-info-section" id="extra-info" aria-labelledby="extra-info-title">
      <h2 id="extra-info-title">Extra Info</h2>

      <div className="contact-grid">
        <GitHubContributionsCard />

        <article className="contact-card contact-card--contact">
          <div className="contact-card__heading">
            <span className="contact-card__icon"><SendIcon /></span>
            <h3>Contact Me</h3>
          </div>
          <div className="contact-card__actions">
            <a className="contact-card__email" href={socialLinks.email} target="_blank" rel="noreferrer">
              <span className="contact-card__action-icon"><MailIcon /></span>
              pranshu23k@gmail.com
            </a>
            <a className="contact-card__linkedin" href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Pranshu Kumar on LinkedIn">
              <span className="contact-card__action-icon"><LinkedInIcon /></span>
              LinkedIn
            </a>
            <ContactForm />
          </div>
        </article>

        <article className="contact-card contact-card--commits">
          <div className="contact-card__heading">
            <span className="contact-card__icon"><PulseIcon /></span>
            <h3>Recent Commits</h3>
          </div>

          <div className="commit-list" aria-live="polite">
            {recentCommits.length > 0 ? recentCommits.map((commit) => (
              <a className="commit-item" href={commit.url} target="_blank" rel="noreferrer" key={`${commit.repository}:${commit.sha}`}>
                <span className="commit-item__summary">
                  <strong className="commit-item__repository">{commit.repository}:</strong>
                  <span className="commit-item__message">{commit.message}</span>
                </span>
                <span className="commit-item__meta">
                  <span className="commit-item__sha">{commit.sha.slice(0, 7)}</span>
                  {commit.date && (
                    <time dateTime={commit.date}>
                      {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(commit.date))}
                    </time>
                  )}
                  <span
                    className="commit-item__changes"
                    aria-label={`${commit.additions ?? 'Unknown number of'} lines added and ${commit.deletions ?? 'unknown number of'} lines removed`}
                  >
                    <span className="commit-item__changes-added">+{commit.additions?.toLocaleString() ?? '?'}</span>
                    <span className="commit-item__changes-separator">/</span>
                    <span className="commit-item__changes-removed">-{commit.deletions?.toLocaleString() ?? '?'}</span>
                  </span>
                </span>
              </a>
            )) : (
              <p className="commit-list__message">
                {commitsLoading && !commitsUnavailable
                  ? 'Fetching the latest activity…'
                  : 'Commit activity is temporarily unavailable.'}
              </p>
            )}
          </div>

        </article>

        <article className="contact-card contact-card--codeforces">
          <div className="contact-card__heading">
            <span className="contact-card__icon"><TrophyIcon /></span>
            <h3>Competitive Programming</h3>
          </div>

          <p className="contact-card__codeforces-platform">Codeforces</p>

          <p className="contact-card__codeforces-rating">
            Peak Rating <strong>1608</strong> · Expert
          </p>

          <ul className="contact-card__codeforces-list">
            <li>Rank <strong>633</strong> globally, Round 952 (Div. 4), 32,000+ participants</li>
            <li>Rank <strong>442</strong> globally, Round 1033 (Div. 2), 12,000+ participants</li>
          </ul>

          <a
            className="contact-card__footer-link"
            href={socialLinks.codeforces}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLinkIcon />
            irrational_integer
          </a>
        </article>
      </div>
    </section>
  )
}

export default ExtraInfoSection
