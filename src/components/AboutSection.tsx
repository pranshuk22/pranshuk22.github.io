import { socialLinks } from '../data/socialLinks'
import ProfileImage from './ProfileImage'

function AboutSection() {
  return (
    <section
      className="content-section about-section"
      id="about"
      aria-labelledby="about-title"
    >
      <div className="about-section__layout">
        <div className="about-section__content">
          <h2 id="about-title">
            Hey! I'm <span className="about-section__name">Pranshu Kumar</span>
          </h2>

          <p>
            <span className="about-section__sentence">
            I'm a final-year undergraduate at <strong>IIT Kanpur</strong>, majoring in{' '}
            <strong>Electrical Engineering</strong> and <strong>Chemical Engineering</strong> with minors
            in <strong>Machine Learning</strong>, <strong>Computer Systems</strong> and <strong>Management Sciences</strong>.
            </span>
            <span className="about-section__sentence">
            My work spans <strong>full-stack engineering</strong>, <strong>systems programming</strong>,{' '}
            <strong>machine learning</strong> and <strong>robotics</strong>, with a growing interest in{' '}
            <strong>reinforcement learning</strong>. I enjoy turning complex technical problems into
            reliable, well-tested software.
              If you want to see more, take a look at my{' '}
              <a className="about-page__inline-link" href="/resume/">resume</a> or continue
              exploring my site!
            </span>
          </p>

          <div className="about-section__links" aria-label="Social links">
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
                />
              </svg>
              GitHub
            </a>

            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z"
                />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        <ProfileImage className="about-section__image" />
      </div>
    </section>
  )
}

export default AboutSection
