import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import { ProjectDialog } from '../components/ProjectsSection'
import { useProjectDialog } from '../components/useProjectDialog'

function ProjectsPage() {
  const {
    selectedProject,
    dialogOrigin,
    isClosing,
    openProject,
    closeProject,
    finishClosing,
  } = useProjectDialog()

  return (
    <main className="standalone-page">
      <section className="projects-page" aria-labelledby="projects-page-title">
        <h1 id="projects-page-title" className="page-section-label">Projects</h1>

        <div className="projects-grid projects-grid--page">
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              isOpen={selectedProject?.title === project.title}
              isClosing={selectedProject?.title === project.title && isClosing}
              onOpen={(origin, trigger) => openProject(project, origin, trigger)}
            />
          ))}
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
    </main>
  )
}

export default ProjectsPage
