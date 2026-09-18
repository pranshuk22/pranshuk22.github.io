import { useRef, useState, type FormEvent, type MouseEvent } from 'react'

// Formspree form IDs are public by design, so the default lives in the source like the GoatCounter code.
const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim() || 'xbgllpeb'
const endpoint = `https://formspree.io/f/${formId}`

const storageKey = 'contact-form-sends'
const cooldownMs = 60 * 1000
const windowMs = 24 * 60 * 60 * 1000
const maxSendsPerWindow = 3

type Status = 'idle' | 'sending' | 'sent' | 'error'

function readSends() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    if (!Array.isArray(parsed)) return []
    const cutoff = Date.now() - windowMs
    return parsed.filter((time): time is number => typeof time === 'number' && time > cutoff)
  } catch {
    return []
  }
}

function recordSend(sends: number[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...sends, Date.now()]))
  } catch {
    // The service still rate limits on its side when storage is unavailable.
  }
}

// Client-side limits only slow down honest double-submits; Formspree enforces the real limits.
function getRateLimitMessage() {
  const sends = readSends()
  const last = sends[sends.length - 1]

  if (last && Date.now() - last < cooldownMs) {
    const seconds = Math.ceil((cooldownMs - (Date.now() - last)) / 1000)
    return `Please wait ${seconds}s before sending another message.`
  }

  if (sends.length >= maxSendsPerWindow) {
    return 'You have reached the daily message limit. Please email me directly instead.'
  }

  return null
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function ContactForm() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  function openDialog() {
    setStatus('idle')
    setMessage('')
    dialogRef.current?.showModal()
    document.body.style.overflow = 'hidden'
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // The dialog has no padding of its own, so a click on it directly is a click outside the panel.
    if (event.target === event.currentTarget) closeDialog()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return


    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot: real visitors never see or fill this field.
    if (data.get('_gotcha')) return

    const limitMessage = getRateLimitMessage()
    if (limitMessage) {
      setStatus('error')
      setMessage(limitMessage)
      return
    }

    setStatus('sending')
    setMessage('')

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      })

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

      recordSend(readSends())
      form.reset()
      setStatus('sent')
      setMessage('Thanks! Your message has been sent.')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again or email me directly.')
    }
  }

  return (
    <>
      <button type="button" className="contact-card__message-button" onClick={openDialog} aria-haspopup="dialog">
        <span className="contact-card__action-icon"><MailIcon /></span>
        Send a message
      </button>

      <dialog
        ref={dialogRef}
        className="contact-dialog"
        aria-labelledby="contact-dialog-title"
        onClick={handleBackdropClick}
        onClose={() => { document.body.style.overflow = '' }}
      >
        <div className="contact-dialog__panel">
          <div className="contact-dialog__header">
            <h3 id="contact-dialog-title">Send me a message</h3>
            <button type="button" className="contact-dialog__close" onClick={closeDialog} aria-label="Close contact form">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-form__field">
            <span className="sr-only">Your name</span>
            <input type="text" name="name" placeholder="Your name" autoComplete="name" required maxLength={100} />
          </label>
          <label className="contact-form__field">
            <span className="sr-only">Your email</span>
            <input type="email" name="email" placeholder="Your email" autoComplete="email" required maxLength={200} />
          </label>
          <label className="contact-form__field">
            <span className="sr-only">Message</span>
            <textarea name="message" placeholder="Message" rows={4} required minLength={10} maxLength={2000} />
          </label>
          <input
            className="contact-form__honeypot"
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
          <p className="contact-form__status" role="status" data-status={status}>{message}</p>
        </form>
        </div>
      </dialog>
    </>
  )
}

export default ContactForm
