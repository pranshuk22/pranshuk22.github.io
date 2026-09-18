import { useContext } from 'react'
import { ServiceStatusContext } from './serviceStatus'

export function useServiceStatus() {
  const context = useContext(ServiceStatusContext)
  if (!context) throw new Error('useServiceStatus must be used inside ServiceStatusProvider')
  return context
}
