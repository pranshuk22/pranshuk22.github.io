import { experiences } from '../data/experience'
import { renderHighlight } from './highlightText'

function ExperienceSection() {
  return (
    <section
      className="content-section experience-section"
      id="experience"
      aria-labelledby="experience-title"
    >
      <h2 id="experience-title">Experience</h2>

      <ol className="experience-timeline">
        {experiences.map((experience) => (
          <li className="experience-entry" key={`${experience.company}-${experience.role}`}>
            <span className="experience-entry__marker" aria-hidden="true" />

            <article className="experience-entry__content">
              <h3 className="experience-entry__title">{experience.company}</h3>

              <div className="experience-entry__meta">
                <p className="experience-entry__role">{experience.role}</p>
                <p className="experience-entry__date">{experience.date}</p>
              </div>

              <ul className="experience-entry__highlights">
                {experience.highlights.map((highlight) => (
                  <li key={highlight}>{renderHighlight(highlight)}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default ExperienceSection
