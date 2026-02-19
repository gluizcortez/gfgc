import { app, net } from 'electron'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const GITHUB_API_URL = 'https://api.github.com/repos/gluizcortez/gfgc/releases/latest'

export interface UpdateAsset {
  name: string
  url: string
  size: number
}

export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  assets: UpdateAsset[]
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = app.getVersion()

  const response = await net.fetch(GITHUB_API_URL, {
    headers: { 'User-Agent': 'GFGC-App' }
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const release = await response.json()
  const releaseName: string = release.name || release.tag_name || ''
  const latestVersion = releaseName.replace(/^v/i, '')

  const assets: UpdateAsset[] = (release.assets || []).map((a: { name: string; browser_download_url: string; size: number }) => ({
    name: a.name,
    url: a.browser_download_url,
    size: a.size
  }))

  const hasUpdate = compareVersions(currentVersion, latestVersion) < 0

  return { hasUpdate, currentVersion, latestVersion, assets }
}

export async function downloadUpdate(url: string, filename: string): Promise<{ success: boolean; filePath?: string }> {
  const tempDir = join(app.getPath('temp'), 'gfgc-update')
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  const filePath = join(tempDir, filename)

  const response = await net.fetch(url, {
    headers: { 'User-Agent': 'GFGC-App' }
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  const writeStream = createWriteStream(filePath)

  return new Promise((resolve, reject) => {
    writeStream.write(Buffer.from(buffer), (err) => {
      if (err) {
        reject(err)
        return
      }
      writeStream.end(() => {
        resolve({ success: true, filePath })
      })
    })
  })
}
