/**
 * Document completeness scorer for autoresearch verify.
 * Checks required sections, word counts, and quality indicators.
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const PAGES_DIR = join(import.meta.dirname, '..', 'app')

const REQUIRED_PAGES = [
  { path: 'page.mdx', name: 'Overview', minWords: 300 },
  { path: 'glossary/page.mdx', name: 'Glossary', minWords: 500 },
  { path: 'bridges/page.mdx', name: 'Bridges', minWords: 500 },
  { path: 'path-frit/page.mdx', name: 'Path 1: Frit', minWords: 500 },
  { path: 'path-roomtemp/page.mdx', name: 'Path 2: Room-Temp', minWords: 500 },
  { path: 'simulation/page.mdx', name: 'Simulation', minWords: 300 },
  { path: 'action-plan/page.mdx', name: 'Action Plan', minWords: 300 },
  { path: 'bom/page.mdx', name: 'BOM', minWords: 300 },
]

const QUALITY_CHECKS = [
  { name: 'README exists', check: () => existsSync(join(PAGES_DIR, '..', '..', 'README.md')) },
  { name: 'Layout has nav', check: () => {
    const layout = readFileSync(join(PAGES_DIR, 'layout.tsx'), 'utf-8')
    return layout.includes('nav') && layout.includes('NAV_ITEMS')
  }},
  { name: 'MDX components styled', check: () => existsSync(join(PAGES_DIR, '..', 'mdx-components.tsx')) },
  { name: 'No TODO/TBD/placeholder', check: () => {
    let clean = true
    for (const page of REQUIRED_PAGES) {
      const fp = join(PAGES_DIR, page.path)
      if (existsSync(fp)) {
        const content = readFileSync(fp, 'utf-8')
        if (/TODO|TBD|FIXME|placeholder|Lorem/i.test(content)) {
          clean = false
        }
      }
    }
    return clean
  }},
]

let totalScore = 0
let maxScore = 0
const results = []

// Check required pages
for (const page of REQUIRED_PAGES) {
  const fp = join(PAGES_DIR, page.path)
  maxScore += 10 // existence: 10 points each

  if (existsSync(fp)) {
    const content = readFileSync(fp, 'utf-8')
    const words = content.split(/\s+/).filter(w => w.length > 0).length
    const tables = (content.match(/\|.*\|/g) || []).length
    const headings = (content.match(/^#{1,3}\s/gm) || []).length

    let pageScore = 5 // exists = 5 points
    if (words >= page.minWords) pageScore += 3 // word count = 3 points
    if (tables >= 1) pageScore += 1 // has tables = 1 point
    if (headings >= 3) pageScore += 1 // has structure = 1 point

    totalScore += pageScore
    results.push({ page: page.name, score: pageScore, words, tables, headings, status: pageScore >= 8 ? 'GOOD' : pageScore >= 5 ? 'OK' : 'WEAK' })
  } else {
    results.push({ page: page.name, score: 0, words: 0, tables: 0, headings: 0, status: 'MISSING' })
  }
}

// Quality checks (5 points each)
for (const qc of QUALITY_CHECKS) {
  maxScore += 5
  const pass = qc.check()
  if (pass) totalScore += 5
  results.push({ page: `[QC] ${qc.name}`, score: pass ? 5 : 0, status: pass ? 'PASS' : 'FAIL' })
}

const pct = Math.round(totalScore / maxScore * 100)

// Output
console.log('=== Document Completeness Score ===')
console.log('')
for (const r of results) {
  const bar = '█'.repeat(r.score) + '░'.repeat(10 - r.score)
  const extra = r.words ? ` (${r.words}w, ${r.tables}t, ${r.headings}h)` : ''
  console.log(`  ${r.status.padEnd(7)} ${bar} ${r.page}${extra}`)
}
console.log('')
console.log(`SCORE: ${pct}`)
