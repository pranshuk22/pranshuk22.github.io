# Portfolio

My personal portfolio (Pranshu Kumar), built with React, TypeScript, and Vite.

It contains my experience, leadership, skills, projects, and education. It is deployed as a static site to GitHub Pages.

## Features

- Responsive pages with sections for an intro, skills, experience, leadership, projects, and education
- Additional `/about/`, `/projects/`, and `/resume/` pages
- Client-side page transitions with browser history support and reduced-motion handling
- Project and profile content stored in typed data modules under `src/data/`
- [Catppuccin](https://catppuccin.com) theme controls and GitHub contribution/commit data sections
- Automatic deployment through GitHub Actions and GitHub Pages

## Tech stack

- React 19
- TypeScript
- Vite
- CSS
- GitHub Actions for deployment

## Running development environment

### Requirements

- Node.js LTS
- npm
- Git, if you want deployment metadata to be populated locally

### Install dependencies

```bash
npm install
```

### Configure environment variables (optional)

Copy `.env.example` to `.env.local` if you want to override the GoatCounter analytics code:

```bash
cp .env.example .env.local
```

The view counter in the footer uses [GoatCounter](https://www.goatcounter.com/) - sign up for a free account with the code `pranshuk22` (or update `VITE_GOATCOUNTER_CODE` to your own code) for it to report real numbers. Without an account, the counter simply shows no data.

### Run locally

```bash
npm run dev
```

Vite serves the portfolio locally with hot module replacement.

### Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/` and includes the four HTML entry points:

- `/`
- `/about/`
- `/projects/`
- `/resume/`

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Managing content

Most portfolio content is kept separate from layout code:

- `src/data/experience.ts` - work experience
- `src/data/leadership.ts` - leadership / positions of responsibility
- `src/data/projects.ts` - project cards and links
- `src/data/githubContributions.ts` and `src/data/githubCommits.ts` - GitHub activity data
- `src/data/socialLinks.ts` - contact and social links
- `src/data/resume.ts` - public paths for the Software Engineering / Machine Learning resume PDFs
- `src/components/` - reusable sections and UI components
- `src/pages/` - dedicated page compositions
- `src/styles/` - base, theme, layout, and component styles

To update the portfolio, edit the relevant data module or component, then run `npm run lint` and `npm run build`.

To publish a resume, add `public/data/resume-software.pdf` and/or `public/data/resume-ml.pdf`. The `/resume/` page has a toggle between the two (Software Engineering shown by default) and will automatically detect and display each one, with open and download actions. Until a given variant is added, that toggle shows a "coming soon" placeholder.

### Profile photo

The About section uses `public/images/profile.jpg`, rendered through `src/components/ProfileImage.tsx`. Replace that file (keeping the same name) to swap in a different photo.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Installs dependencies with `npm ci`
2. Builds the site with the GitHub commit SHA as deployment metadata
3. Uploads `dist/` as a GitHub Pages artifact
4. Deploys the artifact to GitHub Pages

The repository's GitHub Pages environment must be configured to use GitHub Actions.
