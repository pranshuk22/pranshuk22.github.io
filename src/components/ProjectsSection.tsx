import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { featuredProjects } from '../data/projects'
import type { Project } from '../types/project'
import ProjectCard, { ProjectCardContent, ProjectLinks } from './ProjectCard'
import { renderHighlight } from './highlightText'
import { useProjectDialog, type DialogOrigin } from './useProjectDialog'

type ProjectDialogProps = {
  project: Project
  onClose: () => void
  onExitComplete: () => void
  origin: DialogOrigin
  isClosing: boolean
}

const minDialogContentScale = 1
const maxDialogContentScale = 1.25

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => (
    !element.closest('[inert]')
      && !element.hasAttribute('aria-hidden')
      && element.getClientRects().length > 0
  ))
}

function geometryMatches(
  left: number,
  top: number,
  width: number,
  height: number,
  geometry: DialogOrigin,
) {
  const tolerance = 0.5
  return Math.abs(left - geometry.left) <= tolerance
    && Math.abs(top - geometry.top) <= tolerance
    && Math.abs(width - geometry.width) <= tolerance
    && Math.abs(height - geometry.height) <= tolerance
}

function getResponsiveDialogBounds(dialog: HTMLElement) {
  if (!dialog.classList.contains('project-dialog--positioned') || !dialog.parentElement) {
    return dialog.getBoundingClientRect()
  }

  const measuredDialog = dialog.cloneNode(true) as HTMLElement
  measuredDialog.classList.remove('project-dialog--positioned')
  measuredDialog.removeAttribute('data-closing')
  measuredDialog.removeAttribute('data-open-complete')
  measuredDialog.setAttribute('aria-hidden', 'true')
  measuredDialog.style.animation = 'none'
  measuredDialog.style.pointerEvents = 'none'
  measuredDialog.style.visibility = 'hidden'
  dialog.parentElement.append(measuredDialog)

  const bounds = measuredDialog.getBoundingClientRect()
  measuredDialog.remove()
  return bounds
}

export function ProjectDialog({ project, onClose, onExitComplete, origin, isClosing }: ProjectDialogProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const [dialogGeometry, setDialogGeometry] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [contentScale, setContentScale] = useState(1)
  const [isPositioned, setIsPositioned] = useState(false)
  const [isOpenComplete, setIsOpenComplete] = useState(false)
  const contentScaleRef = useRef(1)
  const isPositionedRef = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const dialogElement = dialog

    function handleFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !dialogElement.contains(event.target)) {
        closeButtonRef.current?.focus()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(dialogElement)
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogElement.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)!
      const activeElement = document.activeElement
      const activeIndex = activeElement instanceof HTMLElement
        ? focusableElements.indexOf(activeElement)
        : -1
      const nextElement = event.shiftKey
        ? activeIndex <= 0 ? lastElement : focusableElements[activeIndex - 1]
        : activeIndex === -1 || activeElement === lastElement
          ? firstElement
          : focusableElements[activeIndex + 1]

      event.preventDefault()
      nextElement.focus()
    }

    document.addEventListener('focusin', handleFocusIn)
    dialogElement.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      dialogElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useLayoutEffect(() => {
    if (isPositioned) closeButtonRef.current?.focus()
  }, [isPositioned])

  useLayoutEffect(() => {
    let frame: number | undefined

    function updateGeometry() {
      const dialog = dialogRef.current
      if (!dialog) return

      const dialogBounds = getResponsiveDialogBounds(dialog)
      const rawContentScale = origin.width > 0 ? dialogBounds.width / origin.width : 1
      const nextContentScale = Math.min(
        maxDialogContentScale,
        Math.max(minDialogContentScale, rawContentScale),
      )

      if (Math.abs(nextContentScale - contentScaleRef.current) > 0.001) {
        contentScaleRef.current = nextContentScale
        setContentScale(nextContentScale)
      }

      setDialogGeometry((currentGeometry) => (
        geometryMatches(
          dialogBounds.left,
          dialogBounds.top,
          dialogBounds.width,
          dialogBounds.height,
          currentGeometry,
        )
          ? currentGeometry
          : {
              left: dialogBounds.left,
              top: dialogBounds.top,
              width: dialogBounds.width,
              height: dialogBounds.height,
            }
      ))

      if (!isPositionedRef.current) {
        isPositionedRef.current = true
        setIsPositioned(true)
      }
    }

    function scheduleGeometryUpdate() {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = undefined
        updateGeometry()
      })
    }

    updateGeometry()
    window.addEventListener('resize', scheduleGeometryUpdate)
    window.addEventListener('orientationchange', scheduleGeometryUpdate)
    window.visualViewport?.addEventListener('resize', scheduleGeometryUpdate)
    window.visualViewport?.addEventListener('scroll', scheduleGeometryUpdate)

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', scheduleGeometryUpdate)
      window.removeEventListener('orientationchange', scheduleGeometryUpdate)
      window.visualViewport?.removeEventListener('resize', scheduleGeometryUpdate)
      window.visualViewport?.removeEventListener('scroll', scheduleGeometryUpdate)
    }
  }, [origin])

  const highlights = project.highlights?.length ? project.highlights : [project.description]

  return createPortal(
    <div
      className="project-dialog-backdrop"
      data-closing={isClosing || undefined}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className={`project-dialog${isPositioned ? ' project-dialog--positioned' : ''}`}
        data-closing={isClosing || undefined}
        data-open-complete={!isClosing && isOpenComplete || undefined}
        tabIndex={-1}
        style={{
          '--project-dialog-origin-left': `${origin.left}px`,
          '--project-dialog-origin-top': `${origin.top}px`,
          '--project-dialog-origin-width': `${origin.width}px`,
          '--project-dialog-origin-height': `${origin.height}px`,
          '--project-dialog-target-left': `${dialogGeometry.left}px`,
          '--project-dialog-target-top': `${dialogGeometry.top}px`,
          '--project-dialog-target-width': `${dialogGeometry.width}px`,
          '--project-dialog-target-height': `${dialogGeometry.height}px`,
          '--project-dialog-expanded-scale': contentScale,
        } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={(event) => {
          if (isClosing && event.animationName === 'project-dialog-close') onExitComplete()
          if (!isClosing && event.animationName === 'project-dialog-open') setIsOpenComplete(true)
        }}
      >
        <div className="project-dialog__content-stack">
          <div className="project-dialog__content project-dialog__content--expanded">
            <button
              ref={closeButtonRef}
              className="project-dialog__close"
              type="button"
              aria-label="Close project details"
              onClick={onClose}
            >
              ×
            </button>
            <h3 id={titleId}>{project.title}</h3>
            <p className="project-dialog__description">{project.description}</p>
            <div className="project-card__technologies project-dialog__technologies">
              <h4>Technologies</h4>
              <ul>
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
            <div className="project-dialog__highlights-reveal">
              <ul className="experience-entry__highlights project-dialog__highlights">
                {highlights.map((highlight) => (
                  <li key={highlight}>{renderHighlight(highlight)}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="project-dialog__content project-dialog__content--compact" aria-hidden="true" inert>
            <ProjectCardContent project={project} showLinks={false} />
          </div>
        </div>
        <ProjectLinks project={project} className="project-dialog__links" />
      </section>
    </div>,
    document.body,
  )
}

function ProjectsSection() {
  const {
    selectedProject,
    dialogOrigin,
    isClosing,
    openProject,
    closeProject,
    finishClosing,
  } = useProjectDialog()

  return (
    <section
      className="content-section projects-section"
      id="projects"
      aria-labelledby="projects-title"
    >
      <h2 id="projects-title">Featured Projects</h2>

      <div className="projects-grid">
        {featuredProjects.map((project) => (
          <ProjectCard
            key={project.title}
            project={project}
            isOpen={selectedProject?.title === project.title}
            isClosing={selectedProject?.title === project.title && isClosing}
            onOpen={(origin, trigger) => openProject(project, origin, trigger)}
          />
        ))}
      </div>

      <div className="projects-section__all">
        <a href="/projects/">See all projects</a>
      </div>

      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          origin={dialogOrigin}
          isClosing={isClosing}
          onClose={closeProject}
          onExitComplete={finishClosing}
        />
      )}
    </section>
  )
}

export default ProjectsSection
