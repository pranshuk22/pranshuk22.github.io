import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const siteMetadataModuleId = 'virtual:site-metadata'
const resolvedSiteMetadataModuleId = `\0${siteMetadataModuleId}`

function readGit(args: string[]) {
  try {
    return execFileSync('git', args, {
      cwd: fileURLToPath(new URL('.', import.meta.url)),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function getDeploymentCommit() {
  return process.env.VITE_DEPLOYMENT_COMMIT?.trim() || readGit(['rev-parse', 'HEAD'])
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const deploymentCommit = command === 'serve' ? 'dev' : getDeploymentCommit()

  return {
    plugins: [
      react(),
      {
        name: 'site-metadata',
        resolveId(id: string) {
          return id === siteMetadataModuleId ? resolvedSiteMetadataModuleId : undefined
        },
        load(id: string) {
          if (id !== resolvedSiteMetadataModuleId) return undefined

          return `export const deploymentCommit = ${JSON.stringify(deploymentCommit)}`
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          home: fromRoot('index.html'),
          about: fromRoot('about/index.html'),
          projects: fromRoot('projects/index.html'),
          resume: fromRoot('resume/index.html'),
        },
      },
    },
  }
})
