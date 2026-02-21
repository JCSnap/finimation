import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const modulesDir = path.join(root, 'src', 'modules')
const publicDir = path.join(root, 'public')
const conceptsDir = path.join(publicDir, 'concepts')

const SITE_URL = (process.env.SITE_URL || 'https://jcsnap.github.io/finimation').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function xmlEscape(value) {
  return htmlEscape(value)
}

function parseMeta(metaContent) {
  const id = metaContent.match(/id:\s*'([^']+)'/)
  const title = metaContent.match(/title:\s*'([^']+)'/)
  const category = metaContent.match(/category:\s*'([^']+)'/)
  const description = metaContent.match(/description:\s*'([^']+)'/)

  if (!id || !title || !category || !description) {
    return null
  }

  return {
    id: id[1],
    title: title[1],
    category: category[1],
    description: description[1],
  }
}

function readModules() {
  const moduleDirs = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  const modules = []

  for (const moduleName of moduleDirs) {
    const metaPath = path.join(modulesDir, moduleName, 'meta.ts')
    if (!fs.existsSync(metaPath)) continue

    const metaContent = fs.readFileSync(metaPath, 'utf8')
    const parsed = parseMeta(metaContent)
    if (!parsed) continue

    modules.push(parsed)
  }

  modules.sort((a, b) => a.title.localeCompare(b.title))
  return modules
}

function writeConceptPage(moduleMeta) {
  const canonical = `${SITE_URL}/concepts/${moduleMeta.id}.html`
  const interactiveUrl = `${SITE_URL}/#/${moduleMeta.id}`
  const homeUrl = `${SITE_URL}/`

  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${htmlEscape(moduleMeta.title)} | Finimation</title>
    <meta name="description" content="${htmlEscape(moduleMeta.description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${htmlEscape(canonical)}" />
    <style>
      body { font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; color: #0f172a; background: #f8fafc; }
      main { max-width: 760px; margin: 64px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; }
      .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin: 0 0 12px; }
      h1 { margin: 0 0 12px; font-size: 30px; }
      p { line-height: 1.65; color: #1e293b; }
      .links { display: flex; gap: 12px; margin-top: 20px; }
      a { text-decoration: none; padding: 10px 14px; border-radius: 999px; border: 1px solid #cbd5e1; color: #0f172a; }
      a.primary { background: #0f172a; color: #fff; border-color: #0f172a; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">${htmlEscape(moduleMeta.category)}</p>
      <h1>${htmlEscape(moduleMeta.title)}</h1>
      <p>${htmlEscape(moduleMeta.description)}</p>
      <p>Interactive model available in the Finimation app.</p>
      <div class="links">
        <a class="primary" href="${htmlEscape(interactiveUrl)}">Open Interactive Module</a>
        <a href="${htmlEscape(homeUrl)}">Browse All Modules</a>
      </div>
    </main>
  </body>
</html>
`

  fs.writeFileSync(path.join(conceptsDir, `${moduleMeta.id}.html`), body)
}

function writeConceptIndex(modules) {
  const listItems = modules
    .map((mod) => {
      return `<li><a href="./${htmlEscape(mod.id)}.html">${htmlEscape(mod.title)}</a><span>${htmlEscape(mod.category)}</span></li>`
    })
    .join('\n')

  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Finance Concepts | Finimation</title>
    <meta name="description" content="Browse all visual finance learning modules in Finimation." />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${SITE_URL}/concepts/index.html" />
    <style>
      body { font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; color: #0f172a; background: #f8fafc; }
      main { max-width: 860px; margin: 56px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
      h1 { margin: 0 0 12px; font-size: 32px; }
      p { color: #334155; line-height: 1.6; }
      ul { list-style: none; padding: 0; margin: 22px 0 0; }
      li { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding: 12px 0; gap: 12px; }
      li a { color: #0f172a; text-decoration: none; font-weight: 600; }
      li span { color: #475569; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Finimation Concepts</h1>
      <p>Index of finance concepts with interactive visual modules.</p>
      <ul>
${listItems}
      </ul>
    </main>
  </body>
</html>
`

  fs.writeFileSync(path.join(conceptsDir, 'index.html'), body)
}

function writeSitemap(modules) {
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/concepts/index.html`,
    ...modules.map((mod) => `${SITE_URL}/concepts/${mod.id}.html`),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>\n    <loc>${xmlEscape(url)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
  )
  .join('\n')}
</urlset>
`

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), body)
}

function writeRobots() {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), body)
}

function cleanConceptPages() {
  if (!fs.existsSync(conceptsDir)) return

  for (const file of fs.readdirSync(conceptsDir)) {
    if (file.endsWith('.html')) {
      fs.unlinkSync(path.join(conceptsDir, file))
    }
  }
}

function main() {
  fs.mkdirSync(publicDir, { recursive: true })
  fs.mkdirSync(conceptsDir, { recursive: true })

  const modules = readModules()
  cleanConceptPages()

  writeConceptIndex(modules)
  for (const moduleMeta of modules) {
    writeConceptPage(moduleMeta)
  }

  writeSitemap(modules)
  writeRobots()

  console.log(`Generated SEO assets for ${modules.length} modules.`)
}

main()
