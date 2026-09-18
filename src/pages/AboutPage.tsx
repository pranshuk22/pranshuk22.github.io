import { socialLinks } from '../data/socialLinks'
import ProfileImage from '../components/ProfileImage'
import {
  CalendarIcon,
  ClockIcon,
  CommitIcon,
  EyeIcon,
  HeartPulseIcon,
  PaletteIcon,
  PulseIcon,
  RocketIcon,
} from '../components/ServiceIcons'

const siteStack = [
  'React 19',
  'TypeScript',
  'Vite',
  'CSS',
  'Node.js',
  'GitHub Actions',
  'GitHub Pages',
] as const

const siteServices = [
  {
    name: 'Recent commit tracker',
    icon: PulseIcon,
    description: (
      <>
        The home page requests my <strong>five latest commits</strong> from the{' '}
        <strong>GitHub REST API</strong>, then fetches each commit's{' '}
        additions and deletions. Successful responses are cached in{' '}
        <strong>local storage</strong> so the last available activity can still be shown if
        GitHub is temporarily unavailable.
      </>
    ),
  },
  {
    name: 'Deployment commit tracker',
    icon: CommitIcon,
    description: (
      <>
        <strong>GitHub Actions</strong> passes the <strong>commit SHA</strong> that triggered a
        production build into <strong>Vite</strong>. A small <strong>virtual module</strong>{' '}
        makes that exact SHA available to the footer, where it is linked to GitHub and includes
        the commit message, date, and change totals.
      </>
    ),
  },
  {
    name: 'Contribution calendar',
    icon: CalendarIcon,
    description: (
      <>
        The contribution grid uses the public <strong>GitHub Contributions API</strong>{' '}
        maintained by <strong>GrubersJoe</strong>. The response is validated, trimmed to the most recent{' '}
        six months, and <strong>cached locally</strong> before it is rendered
        as an accessible calendar.
      </>
    ),
  },
  {
    name: 'View count',
    icon: EyeIcon,
    description: (
      <>
        <strong>GoatCounter</strong> records one <strong>page view</strong> for the current path
        and exposes the <strong>site-wide total</strong> displayed in the footer. Tracking and
        total retrieval happen directly in the <strong>browser</strong>; the portfolio does not
        run its own analytics server.
      </>
    ),
  },
  {
    name: 'Session timer',
    icon: ClockIcon,
    description: (
      <>
        The <strong>footer timer</strong> counts time spent on the site and saves the running
        total in <strong>local storage</strong>, allowing it to continue between visits on the
        same browser.
      </>
    ),
  },
  {
    name: 'Theme preferences',
    icon: PaletteIcon,
    description: (
      <>
        The theme menu offers <strong>four Catppuccin palettes</strong> and{' '}
        <strong>fourteen accent colors</strong>. The selected palette and accent are applied
        through <strong>CSS custom properties</strong> and saved in{' '}
        <strong>local storage</strong> so they persist between visits.
      </>
    ),
  },
  {
    name: 'Service health indicator',
    icon: HeartPulseIcon,
    description: (
      <>
        A shared <strong>React context</strong> collects the state of the deployment metadata,
        recent commits, view counter, and session timer. The footer summarizes those
        checks as <strong>working</strong>, <strong>checking</strong>, or <strong>having
        issues</strong> without relying on a separate monitoring backend.
      </>
    ),
  },
  {
    name: 'Build and deployment',
    icon: RocketIcon,
    description: (
      <>
        Every push to the <strong>main branch</strong> starts a{' '}
        <strong>GitHub Actions</strong> workflow that installs dependencies,{' '}
        <strong>type-checks</strong> and <strong>builds</strong> the site, then publishes the generated
        multi-entry static files to <strong>GitHub Pages</strong>. There is no application
        server or database to maintain.
      </>
    ),
  },
] as const

function AboutPage() {
  return (
    <main className="standalone-page">
      <section className="about-page" aria-labelledby="about-page-title">
        <h1 id="about-page-title" className="about-page__title">About Me</h1>

        <div className="about-page__layout">
          <ProfileImage className="about-page__image" />

          <div className="about-page__content">
            <p>
              <span className="about-page__sentence">
                Hey, I'm Pranshu! I'm a final-year undergraduate at{' '}
                <strong>IIT Kanpur</strong>, majoring in <strong>Electrical Engineering</strong> and{' '}
                <strong>Chemical Engineering</strong> with minors in <strong>Machine Learning</strong>,{' '}
                <strong>Computer Systems</strong>, and <strong>Management Sciences</strong>. This
                summer, I interned as a <strong>Software Engineer</strong> at{' '}
                <strong>Samsara</strong>. I like building cool{' '}
                <a className="about-page__inline-link" href="/projects/">projects</a> across
                systems, robotics, and full-stack software, and I've been getting more into{' '}
                <strong>reinforcement learning</strong> lately.
              </span>
              <span className="about-page__sentence">
                Outside of software and academics, I enjoy playing chess and solving
                programming challenges. I love to learn, build, and explore on my own. Feel free to shoot me an{' '}
                <a className="about-page__inline-link" href={socialLinks.email}>email</a> or
                message if you'd like to chat!
              </span>
            </p>

            <div className="about-page__links" aria-label="Contact links">
              <a href={socialLinks.github} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
                  />
                </svg>
                GitHub
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z"
                  />
                </svg>
                LinkedIn
              </a>
              <a href={socialLinks.email}>
                <svg className="about-page__mail-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                pranshu23k@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="about-site" aria-labelledby="about-site-title">
        <div className="about-site__intro">
          <h2 id="about-site-title">About This Site</h2>
          <p>
            This portfolio is a lightweight, <strong>static web application</strong> built from{' '}
            <strong>React</strong> components and <strong>TypeScript</strong>.{' '}
            <strong>Vite</strong> builds each top-level page from its own HTML entry file.{' '}
            <strong>Shared components</strong> are used for the header, footer, theme
            system, and live data displays. Most content ships with the site; the small amount
            of changing data is requested from{' '}
            public services in your browser.
          </p>
        </div>

        <div className="about-site__stack" aria-label="Site technology stack">
          {siteStack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>

        <div className="about-site__services" aria-label="Site services and implementation details">
          {siteServices.map(({ name, description, icon: Icon }) => (
            <article className="about-site__service" key={name}>
              <span className="about-site__service-icon" aria-hidden="true">
                <Icon />
              </span>
              <div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AboutPage
