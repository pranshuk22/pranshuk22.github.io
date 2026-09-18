import { createContext } from 'react'
import { deploymentCommit } from 'virtual:site-metadata'

export type ServiceKey = 'siteCommit' | 'recentCommits' | 'viewCount' | 'timeOnSite'
export type ServiceHealth = boolean | null
export type ServiceStatus = Record<ServiceKey, ServiceHealth>

export type ServiceStatusContextValue = {
  status: ServiceStatus
  setServiceHealth: (service: ServiceKey, health: boolean) => void
}

export const ServiceStatusContext = createContext<ServiceStatusContextValue | null>(null)

export const initialStatus: ServiceStatus = {
  siteCommit: Boolean(deploymentCommit),
  recentCommits: null,
  viewCount: null,
  timeOnSite: true,
}
