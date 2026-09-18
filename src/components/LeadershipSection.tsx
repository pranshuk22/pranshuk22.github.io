import { leadershipRoles } from '../data/leadership'
import { renderHighlight } from './highlightText'

function LeadershipSection() {
  return (
    <section
      className="content-section leadership-section"
      id="leadership"
      aria-labelledby="leadership-title"
    >
      <h2 id="leadership-title">Leadership</h2>

      <ol className="experience-timeline">
        {leadershipRoles.map((role) => (
          <li className="experience-entry" key={`${role.organization}-${role.role}`}>
            <span className="experience-entry__marker" aria-hidden="true" />

            <article className="experience-entry__content">
              <h3 className="experience-entry__title">{role.organization}</h3>

              <div className="experience-entry__meta">
                <p className="experience-entry__role">{role.role}</p>
                <p className="experience-entry__date">{role.date}</p>
              </div>

              <ul className="experience-entry__highlights">
                {role.highlights.map((highlight) => (
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

export default LeadershipSection
