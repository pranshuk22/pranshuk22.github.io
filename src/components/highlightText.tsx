import type { ReactNode } from 'react'

export function renderHighlight(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const isBold = part.startsWith('**') && part.endsWith('**')

    return isBold ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong> : part
  })
}
