import fs from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const publicDir = resolve(rootDir, 'public')

/** SPA subpath — override in CI via DEPLOY_BASE (e.g. coptic-shell artifact build). */
const APP_BASE = process.env.DEPLOY_BASE || '/app/'
const appBasePath = APP_BASE.replace(/\/$/, '') || '/app'

const MARKETING_PAGES = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/about', 'about.html'],
  ['/about.html', 'about.html'],
  ['/story', 'story.html'],
  ['/story.html', 'story.html'],
  ['/contact', 'contact.html'],
  ['/contact.html', 'contact.html'],
  ['/support', 'support.html'],
  ['/support.html', 'support.html'],
])

const MARKETING_ASSETS = new Set([
  '/static_style.css',
  '/tailwind.cdn.js',
  '/site.js',
  '/contact-form.js',
  '/favicon.ico',
  '/favicon-16.png',
  '/favicon-32.png',
  '/manifest.webmanifest',
  '/icons.svg',
  '/robots.txt',
  '/sitemap.xml',
])

function isAppPath(pathname) {
  return pathname === appBasePath || pathname === `${appBasePath}/` || pathname.startsWith(`${appBasePath}/`)
}

function hasFileExtension(pathname) {
  const lastSegment = pathname.split('/').pop() ?? ''
  return /\.[a-zA-Z0-9]+$/.test(lastSegment)
}

function sendPublicFile(pathname, res) {
  const relativePath = pathname.replace(/^\//, '')
  const filePath = resolve(publicDir, relativePath)

  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false
  }

  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const types = {
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
    svg: 'image/svg+xml',
    png: 'image/png',
    ico: 'image/x-icon',
    webmanifest: 'application/manifest+json; charset=utf-8',
    xml: 'application/xml; charset=utf-8',
    txt: 'text/plain; charset=utf-8',
    html: 'text/html; charset=utf-8',
    woff: 'font/woff',
    woff2: 'font/woff2',
  }

  res.statusCode = 200
  res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream')
  res.end(fs.readFileSync(filePath))
  return true
}

function serveMarketingPage(pathname, res) {
  const page = MARKETING_PAGES.get(pathname)
  if (!page) return false
  return sendPublicFile(`/${page}`, res)
}

function siteRoutingMiddleware(req, res, next) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = url.pathname

  if (MARKETING_ASSETS.has(pathname) && sendPublicFile(pathname, res)) return
  if (pathname.startsWith('/icons/') && sendPublicFile(pathname, res)) return
  if (pathname.startsWith('/images/') && sendPublicFile(pathname, res)) return
  if (pathname.startsWith('/fonts/') && sendPublicFile(pathname, res)) return
  if (serveMarketingPage(pathname, res)) return

  if (isAppPath(pathname)) {
    const isViteInternal =
      pathname.startsWith(`${appBasePath}/@`) ||
      pathname.startsWith(`${appBasePath}/node_modules/`) ||
      pathname.startsWith(`${appBasePath}/src/`)
    const isBuiltAsset = pathname.startsWith(`${appBasePath}/assets/`)

    if (!isViteInternal && !isBuiltAsset && !hasFileExtension(pathname)) {
      req.url = `${appBasePath}/app.html${url.search}`
    }
  }

  next()
}

function siteRoutingPlugin() {
  return {
    name: 'site-routing',
    configureServer(server) {
      server.middlewares.use(siteRoutingMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(siteRoutingMiddleware)
    },
  }
}

export default defineConfig({
  base: APP_BASE,
  plugins: [tailwindcss(), vue(), siteRoutingPlugin()],
  server: {
    proxy: {
      '/api/submitFeedback': {
        target: 'https://coptic-psalmody.web.app',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: resolve(rootDir, 'app.html'),
    },
  },
})
