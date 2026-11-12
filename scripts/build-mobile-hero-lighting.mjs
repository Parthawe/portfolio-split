import { readFile, writeFile } from 'node:fs/promises'
import { gunzipSync, gzipSync } from 'node:zlib'

const assets = new URL('../public/Assets/hdri/', import.meta.url)
const source = gunzipSync(await readFile(new URL('potsdamer_platz_1k.rgbe.gz', assets)))
const sourceWidth = source.readUInt32LE(8)
const sourceHeight = source.readUInt32LE(12)
const sourcePixels = sourceWidth * sourceHeight
if (source.toString('ascii', 0, 8) !== 'PHDR0001' || sourceWidth !== 1024 || sourceHeight !== 512 || source.length !== 16 + sourcePixels * 4) {
  throw new Error('Invalid source lighting texture')
}

const planes = source.subarray(16)
for (let channel = 0; channel < 4; channel++) {
  const offset = channel * sourcePixels
  for (let index = 0; index < sourcePixels; index++) {
    if (index % sourceWidth) planes[offset + index] += planes[offset + index - 1]
  }
}

const width = sourceWidth / 2
const height = sourceHeight / 2
const pixels = width * height
const result = Buffer.alloc(16 + pixels * 4)
source.copy(result, 0, 0, 8)
result.writeUInt32LE(width, 8)
result.writeUInt32LE(height, 12)
for (let y = 0; y < height; y++) {
  const previous = [0, 0, 0, 0]
  for (let x = 0; x < width; x++) {
    const topLeft = y * 2 * sourceWidth + x * 2
    const samples = [topLeft, topLeft + 1, topLeft + sourceWidth, topLeft + sourceWidth + 1]
    const scales = samples.map(index => 2 ** (planes[3 * sourcePixels + index] - 128) / (4 * 255))
    const rgb = [0, 1, 2].map(channel =>
      samples.reduce((sum, index, sample) => sum + planes[channel * sourcePixels + index] * scales[sample], 0)
    )
    const peak = Math.max(...rgb)
    const exponent = peak > 0 ? Math.max(0, Math.floor(Math.log2(peak)) + 129) : 0
    const scale = 255 / 2 ** (exponent - 128)
    const values = [...rgb.map(value => Math.min(255, Math.round(value * scale))), exponent]
    values.forEach((value, channel) => {
      result[16 + channel * pixels + y * width + x] = (value - previous[channel]) & 255
      previous[channel] = value
    })
  }
}

await writeFile(new URL('potsdamer_platz_512.rgbe.gz', assets), gzipSync(result, { level: 9 }))
