import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import type { Page } from '../App'
import { experiences } from '../data/experience'
import { leadershipRoles } from '../data/leadership'
import { projects } from '../data/projects'
import { resumeVariants } from '../data/resume'
import { socialLinks } from '../data/socialLinks'

type TerminalOverlayProps = {
  currentPage: Page
  currentPath: string
  onClose: () => void
  onNavigate: (page: Page) => void
}

type TerminalLine = {
  id: number
  kind: 'prompt' | 'output' | 'banner'
  content: ReactNode
}

type WindowMode = 'normal' | 'minimized' | 'maximized'

type RunCommandHandlers = {
  navigate: (page: Page) => void
  clear: () => void
  close: () => void
  currentPage: Page
  currentPath: string
}

const promptLabel = 'pranshu@portfolio'
const navigablePages: Page[] = ['home', 'about', 'projects', 'resume']
const skillGroupNames = [
  'Languages',
  'Backend & Databases',
  'Machine Learning & Robotics',
  'Scientific Computing',
  'Systems & DevOps',
  'Developer Tools',
]
const commandNames = [
  'help', 'whoami', 'about', 'pwd', 'ls', 'cat', 'open', 'cd', 'contact',
  'skills', 'sudo', 'echo', 'date', 'clear', 'exit', 'quit',
]
const argSuggestions: Record<string, string[]> = {
  ls: ['projects/', 'experience/', 'leadership/', 'skills/'],
  open: ['home', 'about/', 'projects/', 'resume/'],
  cd: ['home', 'about/', 'projects/', 'resume/'],
  cat: ['about.txt'],
  sudo: ['hire-me'],
}
function welcomeBanner(currentPath: string): TerminalLine {
  return {
    id: nextLineId(),
    kind: 'banner',
    content: (
      <>
        Welcome, you're at <strong>{currentPath}</strong>. Type 'help' to see available
        commands, or 'exit' to leave.
      </>
    ),
  }
}

function HelpOutput() {
  return (
    <ul className="terminal-overlay__list">
      <li><code>help</code>: list available commands</li>
      <li><code>whoami</code>: who am I</li>
      <li><code>cat about.txt</code>: short bio</li>
      <li><code>pwd</code>: print the page you're currently on</li>
      <li><code>ls</code>: list what's here (also <code>ls projects</code>, <code>ls experience</code>, <code>ls leadership</code>, <code>ls skills</code>)</li>
      <li><code>open &lt;page&gt;</code> / <code>cd &lt;page&gt;</code>: jump to home / about / projects / resume</li>
      <li><code>contact</code>: how to reach me</li>
      <li><code>sudo hire-me</code>: worth a shot</li>
      <li><code>clear</code>: clear the screen</li>
      <li><code>exit</code>: close this terminal</li>
    </ul>
  )
}

function ContactOutput() {
  return (
    <ul className="terminal-overlay__list">
      <li>email: <a href={socialLinks.email} target="_blank" rel="noreferrer">pranshu23k@gmail.com</a></li>
      <li>github: <a href={socialLinks.github} target="_blank" rel="noreferrer">{socialLinks.github}</a></li>
      <li>linkedin: <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">{socialLinks.linkedin}</a></li>
      <li>codeforces: <a href={socialLinks.codeforces} target="_blank" rel="noreferrer">irrational_integer</a></li>
    </ul>
  )
}

function ListOutput({ items }: { items: string[] }) {
  return (
    <ul className="terminal-overlay__list terminal-overlay__list--compact">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

function runCommand(rawInput: string, handlers: RunCommandHandlers): ReactNode | null {
  const trimmed = rawInput.trim()
  if (!trimmed) return null

  const [rawCmd, ...args] = trimmed.split(/\s+/)
  const cmd = rawCmd.toLowerCase()
  const arg = args.join(' ').toLowerCase().replace(/\/$/, '')

  switch (cmd) {
    case 'help':
      return <HelpOutput />

    case 'whoami':
      return 'pranshu: final-year EE & ChemE undergrad @ IIT Kanpur, software engineering intern at Samsara.'

    case 'pwd':
      return handlers.currentPath

    case 'about':
    case 'cat':
      if (cmd === 'cat' && arg !== 'about.txt' && arg !== 'about') {
        return args.length
          ? `cat: ${args.join(' ')}: No such file`
          : 'cat: missing file operand'
      }
      return (
        <>
          Final-year undergrad at IIT Kanpur, Electrical Engineering &amp; Chemical
          Engineering, minors in Machine Learning, Computer Systems, and Management
          Sciences. Work spans full-stack engineering, systems programming, and ML/robotics
          research.
        </>
      )

    case 'ls': {
      if (arg === 'projects') return <ListOutput items={projects.map((project) => project.title)} />
      if (arg === 'experience') return <ListOutput items={experiences.map((role) => `${role.company}: ${role.role}`)} />
      if (arg === 'leadership') return <ListOutput items={leadershipRoles.map((role) => `${role.organization}: ${role.role}`)} />
      if (arg === 'skills') return <ListOutput items={skillGroupNames} />
      if (arg) return `ls: cannot access '${args.join(' ')}': No such file or directory`

      switch (handlers.currentPage) {
        case 'about':
          return <ListOutput items={['about.txt', 'contact']} />
        case 'projects':
          return <ListOutput items={projects.map((project) => project.title)} />
        case 'resume':
          return <ListOutput items={Object.values(resumeVariants).map((variant) => variant.path.split('/').pop()!)} />
        case 'home':
        default:
          return <ListOutput items={['about/', 'experience/', 'leadership/', 'projects/', 'skills/', 'resume/', 'contact']} />
      }
    }

    case 'open':
    case 'cd': {
      const target = (arg === '' || arg === '~' || arg === '..') ? 'home' : arg
      const page = navigablePages.find((candidate) => candidate === target)

      if (!page) {
        return `${cmd}: ${args.join(' ') || '~'}: no such page. Try: home, about, projects, resume`
      }

      handlers.navigate(page)
      return `Opening ${page === 'home' ? '$HOME/' : `$HOME/${page}/`}…`
    }

    case 'skills':
      return <ListOutput items={skillGroupNames} />

    case 'contact':
      return <ContactOutput />

    case 'sudo':
      if (arg === 'hire-me') {
        return (
          <>
            Permission granted. 🎉 Let's talk: <a href={socialLinks.email} target="_blank" rel="noreferrer">pranshu23k@gmail.com</a>{' '}
            or check the <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>.
          </>
        )
      }
      return `sudo: this terminal doesn't do that`

    case 'echo':
      return args.join(' ')

    case 'date':
      return new Date().toString()

    case 'clear':
      handlers.clear()
      return null

    case 'exit':
    case 'quit':
      handlers.close()
      return null

    default:
      return `command not found: ${rawCmd}. Type 'help' for a list of commands.`
  }
}

let lineIdCounter = 0
function nextLineId() {
  lineIdCounter += 1
  return lineIdCounter
}

function TerminalOverlay({ currentPage, currentPath, onClose, onNavigate }: TerminalOverlayProps) {
  const [lines, setLines] = useState<TerminalLine[]>(() => [welcomeBanner(currentPath)])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [windowMode, setWindowMode] = useState<WindowMode>('normal')
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = linesRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [lines])

  useEffect(() => {
    if (windowMode === 'normal') inputRef.current?.focus()
  }, [windowMode])

  useEffect(() => {
    if (windowMode === 'minimized') return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) {
        inputRef.current?.focus()
      }
    }

    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [windowMode])

  function appendLines(newLines: TerminalLine[]) {
    setLines((current) => [...current, ...newLines])
  }

  function handleSubmit() {
    const value = input
    const trimmed = value.trim()

    if (!trimmed) {
      appendLines([{ id: nextLineId(), kind: 'prompt', content: '' }])
      setInput('')
      return
    }

    setCommandHistory((history) => [...history, trimmed])
    setHistoryIndex(null)
    setDraft('')

    const output = runCommand(trimmed, {
      navigate: (page) => {
        onNavigate(page)
        onClose()
      },
      clear: () => setLines([]),
      close: onClose,
      currentPage,
      currentPath,
    })

    const promptLine: TerminalLine = { id: nextLineId(), kind: 'prompt', content: trimmed }
    setInput('')

    if (output === null) {
      setLines((current) => (current.length === 0 ? current : [...current, promptLine]))
      return
    }

    appendLines([promptLine, { id: nextLineId(), kind: 'output', content: output }])
  }

  function handleTabComplete() {
    if (!input) return

    const parts = input.split(/\s+/)

    if (parts.length === 1) {
      const match = commandNames.find((name) => name.startsWith(parts[0].toLowerCase()))
      if (match) setInput(`${match} `)
      return
    }

    const suggestions = argSuggestions[parts[0].toLowerCase()]
    if (!suggestions) return

    const lastWord = parts.at(-1)!.toLowerCase()
    const match = suggestions.find((option) => option.startsWith(lastWord))
    if (!match) return

    setInput(`${[...parts.slice(0, -1), match].join(' ')} `)
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      handleTabComplete()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key === 'ArrowUp') {
      if (commandHistory.length === 0) return
      event.preventDefault()

      if (historyIndex === null) setDraft(input)

      const nextIndex = historyIndex === null
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1)

      setHistoryIndex(nextIndex)
      setInput(commandHistory[nextIndex])
      return
    }

    if (event.key === 'ArrowDown') {
      if (historyIndex === null) return
      event.preventDefault()

      const nextIndex = historyIndex + 1
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null)
        setInput(draft)
        return
      }

      setHistoryIndex(nextIndex)
      setInput(commandHistory[nextIndex])
    }
  }

  if (windowMode === 'minimized') {
    return createPortal(
      <button
        type="button"
        className="terminal-overlay__chip"
        onClick={() => setWindowMode('normal')}
        aria-label="Restore terminal"
      >
        <span className="terminal-overlay__dot terminal-overlay__dot--green" aria-hidden="true" />
        {promptLabel}
      </button>,
      document.body,
    )
  }

  return createPortal(
    <div
      className="terminal-overlay-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className={`terminal-overlay${windowMode === 'maximized' ? ' terminal-overlay--maximized' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site terminal"
      >
        <div className="terminal-overlay__titlebar">
          <div className="terminal-overlay__dots">
            <button
              type="button"
              className="terminal-overlay__dot terminal-overlay__dot--red"
              aria-label="Close terminal"
              onClick={onClose}
            />
            <button
              type="button"
              className="terminal-overlay__dot terminal-overlay__dot--yellow"
              aria-label="Minimize terminal"
              onClick={() => setWindowMode('minimized')}
            />
            <button
              type="button"
              className="terminal-overlay__dot terminal-overlay__dot--green"
              aria-label={windowMode === 'maximized' ? 'Restore terminal size' : 'Maximize terminal'}
              onClick={() => setWindowMode((mode) => (mode === 'maximized' ? 'normal' : 'maximized'))}
            />
          </div>
          <span className="terminal-overlay__title">{promptLabel}: {currentPath}</span>
        </div>

        <div
          className="terminal-overlay__body"
          ref={linesRef}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line) => (
            <div className={`terminal-overlay__line terminal-overlay__line--${line.kind}`} key={line.id}>
              {line.kind === 'prompt' ? (
                <>
                  <span className="terminal-overlay__prompt-label">{promptLabel}:{currentPath}$</span>{' '}
                  <span className="terminal-overlay__prompt-text">{line.content}</span>
                </>
              ) : line.content}
            </div>
          ))}

          <div className="terminal-overlay__line terminal-overlay__input-row">
            <span className="terminal-overlay__prompt-label">{promptLabel}:{currentPath}$</span>
            <input
              ref={inputRef}
              className="terminal-overlay__input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Terminal command input"
            />
          </div>
        </div>

        <div className="terminal-overlay__hint">
          Press Esc to exit · type <code>help</code> for commands
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default TerminalOverlay
