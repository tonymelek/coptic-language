/**
 * Build the coptic-world.com shell artifacts for this repo:
 *
 *   frontend/dist-shell/language/  — the language SPA built under /language/
 *   frontend/dist-shell/readings/  — the readings placeholder under /readings/
 *
 * Each folder is self-contained (index.html at its root) and is zipped by the
 * publish-shell-artifact workflow as language-dist.zip / readings-dist.zip.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const frontendDir = path.join(repoRoot, 'frontend')
const distDir = path.join(frontendDir, 'dist')
const shellDir = path.join(frontendDir, 'dist-shell')

const LANGUAGE_BASE = '/language/'

// Public paths the SPA needs at runtime (fetched via import.meta.env.BASE_URL).
const APP_PUBLIC_PATHS = [
  'dictionary_pages',
  'dictionary_index',
  'images',
  'fonts',
  'icons',
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  'manifest.webmanifest',
]

console.log(`Building language SPA with DEPLOY_BASE=${LANGUAGE_BASE}`)
execSync('npm run build', {
  cwd: frontendDir,
  env: { ...process.env, DEPLOY_BASE: LANGUAGE_BASE },
  stdio: 'inherit',
})

fs.rmSync(shellDir, { recursive: true, force: true })

// --- /language/ ------------------------------------------------------------
const languageDir = path.join(shellDir, 'language')
fs.mkdirSync(languageDir, { recursive: true })

/**
 * Vite rewrote built asset URLs to /language/..., but hand-written public refs
 * in app.html (favicons, manifest) are still root-absolute. Prefix them —
 * except /shell/ (the shared header, served from the domain root) and paths
 * already under /language/.
 */
function prefixRootPaths(html) {
  return html.replace(
    /(\b(?:href|src|action)=["'])\/(?!language\/|shell\/)/g,
    `$1${LANGUAGE_BASE}`,
  )
}

const appHtml = fs.readFileSync(path.join(distDir, 'app.html'), 'utf8')
fs.writeFileSync(path.join(languageDir, 'index.html'), prefixRootPaths(appHtml))

fs.cpSync(path.join(distDir, 'assets'), path.join(languageDir, 'assets'), { recursive: true })

for (const name of APP_PUBLIC_PATHS) {
  const source = path.join(distDir, name)
  if (!fs.existsSync(source)) continue
  fs.cpSync(source, path.join(languageDir, name), { recursive: true })
}

const manifestPath = path.join(languageDir, 'manifest.webmanifest')
if (fs.existsSync(manifestPath)) {
  const manifest = fs
    .readFileSync(manifestPath, 'utf8')
    .replace(/"start_url":\s*"[^"]*"/, `"start_url": "${LANGUAGE_BASE}"`)
    .replace(/"src":\s*"\/(?!language\/)/g, `"src": "${LANGUAGE_BASE}`)
  fs.writeFileSync(manifestPath, manifest)
}

// --- /readings/ (placeholder until the readings UI ships) -------------------
const readingsDir = path.join(shellDir, 'readings')
fs.mkdirSync(readingsDir, { recursive: true })
fs.cpSync(path.join(repoRoot, 'readings-placeholder'), readingsDir, { recursive: true })

for (const dir of ['language', 'readings']) {
  const index = path.join(shellDir, dir, 'index.html')
  if (!fs.existsSync(index)) {
    console.error(`Missing ${index}`)
    process.exit(1)
  }
}

console.log(`Shell artifacts ready in ${shellDir}`)
