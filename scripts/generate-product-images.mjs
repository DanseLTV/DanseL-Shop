import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'products')

const catalogPath = join(__dirname, '..', 'src', 'data', 'productCatalog.ts')
const catalogSrc = readFileSync(catalogPath, 'utf8')

const idMatches = [...catalogSrc.matchAll(/id: '([^']+)'/g)]
const nameMatches = [...catalogSrc.matchAll(/name: '([^']+)'/g)]

const brandColors = {
  'disney-plus': ['#113CCF', '#0E2F9E'],
  iqiyi: ['#00C13C', '#009933'],
  iwanttfc: ['#0066CC', '#004C99'],
  wow: ['#E91E8C', '#9C27B0'],
  viu: ['#FF6B00', '#FFB800'],
  hbo: ['#5822B4', '#3D1578'],
  'prime-video': ['#00A8E1', '#146EB4'],
  quillbot: ['#22C55E', '#16A34A'],
  grammarly: ['#15C39A', '#0D9488'],
  chatgpt: ['#10A37F', '#0D8A6A'],
}

function colorsForId(id) {
  for (const [key, colors] of Object.entries(brandColors)) {
    if (id.includes(key)) return colors
  }
  return ['#8B5CF6', '#6D28D9']
}

function shortLabel(name) {
  if (name.length <= 22) return name
  return name.replace(' Shared', '').replace(' Profile', '')
}

mkdirSync(outDir, { recursive: true })

const products = idMatches.map((m, i) => ({
  id: m[1],
  label: shortLabel(nameMatches[i]?.[1] ?? m[1]),
}))

for (const p of products) {
  const [c1, c2] = colorsForId(p.id)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${p.label}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <circle cx="680" cy="120" r="180" fill="white" fill-opacity="0.07"/>
  <circle cx="120" cy="480" r="140" fill="white" fill-opacity="0.05"/>
  <text x="400" y="280" text-anchor="middle" fill="white" font-family="Segoe UI, system-ui, sans-serif" font-size="42" font-weight="700">${escapeXml(p.label)}</text>
  <text x="400" y="360" text-anchor="middle" fill="white" fill-opacity="0.8" font-family="Segoe UI, system-ui, sans-serif" font-size="20" letter-spacing="3">DANSEL SHOP</text>
</svg>`

  writeFileSync(join(outDir, `${p.id}.svg`), svg.trim())
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

writeFileSync(
  join(outDir, 'README.txt'),
  `Replace any file with your own PNG/WebP (same filename as product id).\n\n${products.map((p) => p.id).join('\n')}`
)

console.log(`Generated ${products.length} images.`)
