import { useEffect, useRef, useState } from 'react'
import type { Project } from '../types/project'

export type DialogOrigin = {
  left: number
  top: number
  width: number
  height: number
}

const initialDialogOrigin: DialogOrigin = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
}

export function useProjectDialog() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogOrigin, setDialogOrigin] = useState<DialogOrigin>(initialDialogOrigin)
  const [isClosing, setIsClosing] = useState(false)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selectedProject) return

    const pageRoot = document.getElementById('top')
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    pageRoot?.classList.add('project-dialog-page--blurred')
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsClosing(true)
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      pageRoot?.classList.remove('project-dialog-page--blurred')
      pageRoot?.classList.remove('project-dialog-page--closing')
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedProject])

  useEffect(() => {
    const pageRoot = document.getElementById('top')
    if (!pageRoot) return

    pageRoot.classList.toggle('project-dialog-page--closing', Boolean(selectedProject && isClosing))

    return () => pageRoot.classList.remove('project-dialog-page--closing')
  }, [isClosing, selectedProject])

  useEffect(() => {
    if (selectedProject || !previouslyFocusedElement.current) return

    if (previouslyFocusedElement.current.isConnected) {
      previouslyFocusedElement.current.focus()
    }
    previouslyFocusedElement.current = null
  }, [selectedProject])

  function openProject(project: Project, origin: HTMLElement, trigger: HTMLElement = origin) {
    const bounds = origin.getBoundingClientRect()
    setDialogOrigin({
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    })
    previouslyFocusedElement.current = trigger
    setIsClosing(false)
    setSelectedProject(project)
  }

  function closeProject() {
    if (!selectedProject || isClosing) return

    setIsClosing(true)
  }

  function finishClosing() {
    setSelectedProject(null)
    setIsClosing(false)
    setDialogOrigin(initialDialogOrigin)
  }

  return {
    selectedProject,
    dialogOrigin,
    isClosing,
    openProject,
    closeProject,
    finishClosing,
  }
}
