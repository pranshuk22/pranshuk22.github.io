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
              <div className="experience-entry__heading">
              <h3 className="experience-entry__title">
                {experience.company}
                {experience.linkedinUrl && (
                  <a
                    className="experience-entry__linkedin"
                    href={experience.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${experience.company} on LinkedIn`}
                  >
                    <svg viewBox="1.5 2 18.5 18" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z"
                      />
                    </svg>
                  </a>
                )}
              </h3>
                <p className="experience-entry__date">{experience.date}</p>
              </div>

              <p className="experience-entry__role">{experience.role}</p>

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
