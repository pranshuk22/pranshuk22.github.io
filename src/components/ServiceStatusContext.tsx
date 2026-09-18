import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { loadRecentCommits } from '../data/githubCommits'
import { initialStatus, ServiceStatusContext, type ServiceKey } from './serviceStatus'

export function ServiceStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState(initialStatus)

  const setServiceHealth = useCallback((service: ServiceKey, health: boolean) => {
    setStatus((current) => current[service] === health ? current : { ...current, [service]: health })
  }, [])

  useEffect(() => {
    let active = true

    void loadRecentCommits({ forceRefresh: true })
      .then((commits) => {
        if (active) setServiceHealth('recentCommits', commits.length > 0)
      })
      .catch(() => {
        if (active) setServiceHealth('recentCommits', false)
      })

    return () => {
      active = false
    }
  }, [setServiceHealth])

  return (
    <ServiceStatusContext.Provider value={{ status, setServiceHealth }}>
      {children}
    </ServiceStatusContext.Provider>
  )
}
