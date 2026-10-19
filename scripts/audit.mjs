// Pantry layout audit — crawl + measurements
// Usage:  node scripts/audit.mjs [--sites sites.json] [--out audit-results.json]
// Requires: npm i -D playwright  (and `npx playwright install chromium` once)
//
// For every site: dismisses the age gate / location picker, visits the pages listed in
// sites.json at 1440 / 768 / 390 (header also at 360 / 320) and records the same
// measurements the Oct-2026 audit used. Output is JSON you can diff between runs.

import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean))
const sites = JSON.parse(readFileSync(args.sites ?? new URL('./sites.json', import.meta.url), 'utf8'))
const OUT = args.out ?? 'audit-results.json'
const VIEWPORTS = [[1440, 900], [768, 1024], [390, 844]]

const GATE = () => {
  const b = [...document.querySelectorAll('button.age-gate-btn')].find((b) => /yes/i.test(b.innerText))
  if (b) { b.click(); return true }
  return false
}

// Runs inside the page. Keep in sync with the console checks in checks.js.
const MEASURE = () => {
  const vw = innerWidth, de = document.documentElement
  const vis = (e) => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const res = { vw, scrollWidth: de.scrollWidth, scrollHeight: de.scrollHeight }

  // header: logo vs icon cluster
  const hdr = document.querySelector('header')
  if (hdr) {
    const lg = [...hdr.querySelectorAll('.df-navbar-logo, img')].find(vis)
    const btns = [...hdr.querySelectorAll('button')].filter(vis).filter((b) => !/menu/i.test(b.getAttribute('aria-label') || ''))
    const L = lg?.getBoundingClientRect()
    const hit = L ? btns.filter((b) => { const r = b.getBoundingClientRect(); return r.left < L.right && r.right > L.left }) : []
    res.header = { height: Math.round(hdr.getBoundingClientRect().height), position: getComputedStyle(hdr).position, logoRight: L && Math.round(L.right), overlaps: hit.map((b) => b.getAttribute('aria-label')) }
    const ab = document.querySelector('.df-announcement-bar')
    res.announcementHeight = ab ? Math.round(ab.getBoundingClientRect().height) : 0
  }
  // low-stock badge clipping
  const badges = [...document.querySelectorAll('.df-pc-lowstock')].filter(vis)
  res.lowstock = { count: badges.length, clipped: badges.filter((e) => e.scrollWidth > e.clientWidth + 1).length }
  // PDP breadcrumb vs gallery
  const crumb = document.querySelector('.df-pd-crumbs'); const img = document.querySelector('main img'); const h1 = document.querySelector('h1')
  if (crumb && img) res.pdp = { crumbTop: Math.round(crumb.getBoundingClientRect().top + scrollY), imageTop: Math.round(img.getBoundingClientRect().top + scrollY), imageHeight: Math.round(img.getBoundingClientRect().height), h1Top: h1 && Math.round(h1.getBoundingClientRect().top + scrollY) }
  // carousel arrows over items
  const arrows = [...document.querySelectorAll('.df-fc-arrow, .df-pcarousel-arrow')].filter(vis)
  const items = [...document.querySelectorAll('.df-fc-tile, .df-pc')].filter(vis)
  res.arrowOverlaps = arrows.filter((a) => { const A = a.getBoundingClientRect(); return items.some((t) => { const r = t.getBoundingClientRect(); return r.left < A.right && r.right > A.left && r.top < A.bottom && r.bottom > A.top }) }).length
  // tap targets
  const ints = [...document.querySelectorAll('a,button,[role=button],select')].filter(vis)
  res.smallTargets = ints.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && (r.width < 28 || r.height < 28) }).length
  // small text
  res.smallText = [...document.querySelectorAll('body *')].filter((e) => !['SCRIPT', 'STYLE', 'svg', 'path'].includes(e.tagName) && vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3) && parseFloat(getComputedStyle(e).fontSize) < 12).length
  // images without dimensions
  const imgs = [...document.images].filter(vis)
  res.images = { total: imgs.length, noDimensions: imgs.filter((im) => !im.getAttribute('width') && !im.getAttribute('height') && !/\d/.test(getComputedStyle(im).aspectRatio || '')).length }
  res.skeletons = document.querySelectorAll('.df-pc-skeleton').length
  res.h1Count = document.querySelectorAll('h1').length
  return res
}

const browser = await chromium.launch()
const results = { ranAt: new Date().toISOString(), sites: {} }
for (const site of sites) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  results.sites[site.origin] = {}
  for (const path of site.pages) {
    const rec = {}
    for (const [w, h] of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: h })
      await page.goto(site.origin + path, { waitUntil: 'commit' })
      await page.waitForTimeout(2500)
      await page.evaluate(GATE); await page.waitForTimeout(600)
      if (/location-selection/.test(page.url())) { await page.evaluate(() => document.querySelector('button.lsp-common-card')?.click()); await page.waitForTimeout(1500); await page.goto(site.origin + path, { waitUntil: 'commit' }); await page.waitForTimeout(2500) }
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(400); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300)
      rec[w] = await page.evaluate(MEASURE)
      if (path === '/' && w === 390) for (const nw of [360, 320]) { await page.setViewportSize({ width: nw, height: 780 }); await page.waitForTimeout(400); rec[nw] = { header: (await page.evaluate(MEASURE)).header } }
    }
    results.sites[site.origin][path] = rec
    console.log(site.origin + path, Object.fromEntries(Object.entries(rec).map(([w, r]) => [w, r.header ? `hdr ${r.header.height}px overlaps:${r.header.overlaps?.length ?? 0}` : ''])))
  }
  await ctx.close()
}
await browser.close()
writeFileSync(OUT, JSON.stringify(results, null, 2))
console.log('wrote', OUT)
