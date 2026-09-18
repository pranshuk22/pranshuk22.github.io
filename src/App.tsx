import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import AboutSection from './components/AboutSection'
import ExtraInfoSection from './components/ExtraInfoSection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import LeadershipSection from './components/LeadershipSection'
import ProjectsSection from './components/ProjectsSection'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import SkillsSection from './components/SkillsSection'
import { ServiceStatusProvider } from './components/ServiceStatusContext'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import ResumePage from './pages/ResumePage'

export type Page = 'home' | 'about' | 'projects' | 'resume'

const pageTitles: Record<Page, string> = {
  home: 'Pranshu Kumar | Home',
  about: 'Pranshu Kumar | About',
  projects: 'Pranshu Kumar | Projects',
  resume: 'Pranshu Kumar | Resume',
}

function getPageFromPath(pathname: string): Page | null {
  const path = pathname.replace(/\/+$/, '').toLowerCase()

  if (path.endsWith('/about')) return 'about'
  if (path.endsWith('/projects')) return 'projects'
  if (path.endsWith('/resume')) return 'resume'
  if (path === '') return 'home'

  return null
}

function getCurrentPage(): Page {
  return getPageFromPath(window.location.pathname) ?? 'home'
}

function HomePage() {
  return (
    <main>
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <LeadershipSection />
      <EducationSection />
      <ExtraInfoSection />
    </main>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage)
  const [fallbackTransitionKey, setFallbackTransitionKey] = useState(0)

  const transitionToPage = useCallback((nextPage: Page, href?: string) => {
    if (nextPage === currentPage) return

    const updatePage = () => {
      if (href) window.history.pushState(null, '', href)
      setCurrentPage(nextPage)
      document.title = pageTitles[nextPage]
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updatePage()
      return
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(updatePage))
      return
    }

    updatePage()
    setFallbackTransitionKey((key) => key + 1)
  }, [currentPage])

  useEffect(() => {
    const handleHistoryNavigation = () => transitionToPage(getCurrentPage())
    const handleLinkNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || !(event.target instanceof Element)
      ) return

      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.download || (link.target && link.target !== '_self')) return

      const url = new URL(link.href, window.location.href)
      const nextPage = url.origin === window.location.origin
        ? getPageFromPath(url.pathname)
        : null

      if (!nextPage) return

      event.preventDefault()
      transitionToPage(nextPage, `${url.pathname}${url.search}${url.hash}`)
    }

    window.addEventListener('popstate', handleHistoryNavigation)
    document.addEventListener('click', handleLinkNavigation)

    return () => {
      window.removeEventListener('popstate', handleHistoryNavigation)
      document.removeEventListener('click', handleLinkNavigation)
    }
  }, [transitionToPage])

  return (
    <ServiceStatusProvider>
      <div id="top">
        <SiteHeader currentPage={currentPage} onNavigate={transitionToPage} />
        <div
          className={fallbackTransitionKey > 0 ? 'page-view page-view--fallback-transition' : 'page-view'}
          key={`${currentPage}-${fallbackTransitionKey}`}
        >
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'projects' && <ProjectsPage />}
          {currentPage === 'resume' && <ResumePage />}
        </div>
        <SiteFooter />
      </div>
    </ServiceStatusProvider>
  )
}

export default App
