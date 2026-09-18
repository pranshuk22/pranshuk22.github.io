import { useEffect, useRef, useState } from 'react'
import TerminalOverlay from './TerminalOverlay'
import ThemeMenu from './ThemeMenu'
import type { Page } from '../App'

type SiteHeaderProps = {
  currentPage: Page
  onNavigate: (nextPage: Page, href?: string) => void
}

const pageDetails: Record<Page, { label: string; href: string; path: string }> = {
  home: { label: 'Home', href: '/', path: '$HOME/' },
  about: { label: 'About', href: '/about/', path: '$HOME/about/' },
  projects: { label: 'Projects', href: '/projects/', path: '$HOME/projects/' },
  resume: { label: 'Resume', href: '/resume/', path: '$HOME/resume/' },
}

const terminalMinWidthQuery = '(min-width: 40rem)'
const mobileMenuQuery = '(max-width: 34rem)'

function SiteHeader({ currentPage, onNavigate }: SiteHeaderProps) {
  const currentPath = pageDetails[currentPage].path
  const pagePath = currentPath.slice('$HOME'.length)
  const [canOpenTerminal, setCanOpenTerminal] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(terminalMinWidthQuery).matches
  ))
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const prefetchLinks = Object.entries(pageDetails)
      .filter(([page]) => page !== currentPage)
      .map(([, details]) => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'document'
        link.href = details.href
        document.head.append(link)
        return link
      })

    return () => prefetchLinks.forEach((link) => link.remove())
  }, [currentPage])

  useEffect(() => {
    const query = window.matchMedia(terminalMinWidthQuery)
    const updateCanOpenTerminal = () => {
      setCanOpenTerminal(query.matches)
      if (!query.matches) setIsTerminalOpen(false)
    }

    updateCanOpenTerminal()
    query.addEventListener('change', updateCanOpenTerminal)

    return () => query.removeEventListener('change', updateCanOpenTerminal)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const query = window.matchMedia(mobileMenuQuery)
    function closeWhenWide() {
      if (!query.matches) setIsMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    query.addEventListener('change', closeWhenWide)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
      query.removeEventListener('change', closeWhenWide)
    }
  }, [isMenuOpen])

  function handleHomeClick() {
    if (currentPage !== 'home') {
      onNavigate('home', pageDetails.home.href)
    }
  }

  function handleCursorClick() {
    if (canOpenTerminal) setIsTerminalOpen(true)
  }

  function handleTerminalNavigate(page: Page) {
    onNavigate(page, pageDetails[page].href)
  }

  return (
    <header className="site-header" ref={headerRef} data-menu-open={isMenuOpen}>
      <div className="site-header__inner">
        <div className="site-header__brand" aria-label={`Current path: ${currentPath}`}>
          <button
            type="button"
            className="site-header__home-path"
            aria-label={currentPage !== 'home' ? 'Go to home page' : undefined}
            disabled={currentPage === 'home'}
            onClick={handleHomeClick}
          >
            $HOME
          </button>
          <span className="site-header__page-path">{pagePath}</span>
          <button
            type="button"
            className={`site-header__cursor${canOpenTerminal ? ' site-header__cursor--interactive' : ''}`}
            aria-label={canOpenTerminal ? 'Open terminal' : undefined}
            aria-haspopup={canOpenTerminal ? 'dialog' : undefined}
            aria-expanded={canOpenTerminal ? isTerminalOpen : undefined}
            disabled={!canOpenTerminal}
            onClick={handleCursorClick}
          />
        </div>

        <button
          type="button"
          className="site-header__menu-button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="site-header__menu-bar" aria-hidden="true" />
          <span className="site-header__menu-bar" aria-hidden="true" />
          <span className="site-header__menu-bar" aria-hidden="true" />
        </button>

        <nav className="site-header__nav" id="primary-navigation" aria-label="Primary navigation">
          {(Object.entries(pageDetails) as [Page, (typeof pageDetails)[Page]][])
            .map(([page, details]) => (
              <a
                href={details.href}
                key={page}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {details.label}
              </a>
            ))}
          <ThemeMenu />
        </nav>
      </div>

      {isTerminalOpen && (
        <TerminalOverlay
          currentPage={currentPage}
          currentPath={currentPath}
          onClose={() => setIsTerminalOpen(false)}
          onNavigate={handleTerminalNavigate}
        />
      )}
    </header>
  )
}

export default SiteHeader
