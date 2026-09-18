import { useRef } from 'react'
import type { Project } from '../types/project'

type ProjectCardProps = {
  project: Project
  onOpen: (origin: HTMLElement, trigger: HTMLButtonElement) => void
  isOpen?: boolean
  isClosing?: boolean
}

type ProjectCardContentProps = {
  project: Project
  showLinks?: boolean
}

type ProjectLinksProps = {
  project: Project
  className?: string
}

function GitHubIcon() {
  return (
    <svg className="project-card__source-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  )
}

export function ProjectLinks({ project, className = '' }: ProjectLinksProps) {
  if (!project.liveUrl && !project.sourceUrl) return null

  return (
    <p className={`project-card__links${className ? ` ${className}` : ''}`}>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer">View project</a>
      )}
      {project.liveUrl && project.sourceUrl && <span aria-hidden="true">/</span>}
      {project.sourceUrl && (
        <a href={project.sourceUrl} target="_blank" rel="noreferrer">
          <GitHubIcon />
          View source
        </a>
      )}
    </p>
  )
}

export function ProjectCardContent({ project, showLinks = true }: ProjectCardContentProps) {
  return (
    <>
      <h3>{project.title}</h3>
      <p className="project-card__description">{project.description}</p>

      <div className="project-card__technologies">
        <h4>Technologies</h4>
        <ul>
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>

      {showLinks && <ProjectLinks project={project} />}
    </>
  )
}

function ProjectCard({ project, onOpen, isOpen = false, isClosing = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  return (
    <article
      ref={cardRef}
      className={`project-card${isOpen ? isClosing ? ' project-card--returning' : ' project-card--hidden' : ''}`}
      aria-hidden={isOpen}
      inert={isOpen || undefined}
    >
      <button
        className="project-card__open"
        type="button"
        tabIndex={isOpen ? -1 : 0}
        aria-label={`Open details for ${project.title}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={(event) => onOpen(cardRef.current ?? event.currentTarget, event.currentTarget)}
      />
      <div className="project-card__content">
        <ProjectCardContent project={project} showLinks={false} />
      </div>
      <ProjectLinks project={project} />
    </article>
  )
}

export default ProjectCard
