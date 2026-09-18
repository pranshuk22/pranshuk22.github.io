import { useEffect, useState } from 'react'
import { defaultResumeVariant, resumeVariants, type ResumeVariant } from '../data/resume'

type ResumeStatus = 'checking' | 'available' | 'missing'

const resumeVariantOrder: ResumeVariant[] = ['software', 'ml']

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2.75h7l5 5V21.25H6z" />
      <path d="M13 2.75v5h5M9 12h6M9 16h6" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6" />
    </svg>
  )
}

function ResumePage() {
  const [variant, setVariant] = useState<ResumeVariant>(defaultResumeVariant)
  const [status, setStatus] = useState<ResumeStatus>('checking')
  const [checkedVariant, setCheckedVariant] = useState<ResumeVariant | null>(null)
  const resume = resumeVariants[variant]

  if (checkedVariant !== variant && status !== 'checking') {
    setStatus('checking')
  }

  useEffect(() => {
    const controller = new AbortController()

    fetch(resume.path, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        const contentType = response.headers.get('content-type') ?? ''
        setStatus(response.ok && contentType.includes('application/pdf') ? 'available' : 'missing')
        setCheckedVariant(variant)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setStatus('missing')
        setCheckedVariant(variant)
      })

    return () => controller.abort()
  }, [resume.path, variant])

  return (
    <main className="standalone-page">
      <section className="resume-page" aria-labelledby="resume-page-title">
        <div className="resume-page__intro">
          <h1 id="resume-page-title" className="page-section-label">Resume</h1>
        </div>

        <div className="resume-page__toggle" role="tablist" aria-label="Resume type">
          {resumeVariantOrder.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={variant === key}
              className={variant === key ? 'is-active' : undefined}
              onClick={() => setVariant(key)}
            >
              {resumeVariants[key].label}
            </button>
          ))}
        </div>

        {status === 'available' && (
          <>
            <div className="resume-page__toolbar">
              <div className="resume-page__actions" aria-label="Resume actions">
                <a href={resume.path} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon />
                  Open PDF
                </a>
                <a href={resume.path} download={resume.downloadName}>
                  <DownloadIcon />
                  Download
                </a>
              </div>
            </div>

            <div className="resume-page__viewer">
              <iframe
                src={`${resume.path}#view=FitH&toolbar=1`}
                title={`Pranshu Kumar ${resume.label} resume`}
              />
            </div>
          </>
        )}

        {status !== 'available' && (
          <div className="resume-page__empty" role="status" aria-live="polite">
            <span className="resume-page__document-icon"><DocumentIcon /></span>
            <h2>{status === 'checking' ? 'Loading resume…' : 'Resume coming soon'}</h2>
            <p>
              {status === 'checking'
                ? 'Checking for the latest PDF.'
                : `The ${resume.label} PDF has not been uploaded yet. Please check back soon.`}
            </p>
          </div>
        )}

      </section>
    </main>
  )
}

export default ResumePage
