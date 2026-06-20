import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('PWA assets', () => {
  it('uses the Lifestack title and manifest metadata', () => {
    const html = projectFile('index.html')
    const manifest = JSON.parse(projectFile('public/manifest.webmanifest')) as {
      name: string
      short_name: string
      display: string
      icons: Array<{ sizes: string }>
    }

    expect(html).toContain('<title>Lifestack</title>')
    expect(html).toContain('href="/manifest.webmanifest"')
    expect(manifest).toMatchObject({
      name: 'Lifestack',
      short_name: 'Lifestack',
      display: 'standalone',
    })
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512'])
  })

  it('keeps authenticated API traffic out of the service worker cache', () => {
    const serviceWorker = projectFile('public/sw.js')

    expect(serviceWorker).toContain("url.pathname.startsWith('/v1/')")
    expect(serviceWorker).toContain("url.pathname.startsWith('/api/')")
  })
})
