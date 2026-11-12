import { DataUtils } from 'three'

/** Lossless RGBE channel-plane delta encoding; output matches RGBELoader's half floats. */
export function decodeHeroEnvironment(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  if (new TextDecoder().decode(bytes.subarray(0, 8)) !== 'PHDR0001') throw new Error('Invalid hero lighting header')
  const header = new DataView(buffer)
  const width = header.getUint32(8, true), height = header.getUint32(12, true)
  const count = width * height
  if (width !== 1024 || height !== 512 || bytes.length !== 16 + count * 4) throw new Error('Invalid hero lighting dimensions')
  const planes = bytes.subarray(16)
  for (let channel = 0; channel < 4; channel++) {
    const offset = channel * count
    for (let i = 0; i < count; i++) if (i % width) planes[offset + i] = (planes[offset + i] + planes[offset + i - 1]) & 255
  }
  const tables = new Map<number, Uint16Array>()
  const data = new Uint16Array(count * 4)
  for (let i = 0; i < count; i++) {
    const exponent = planes[count * 3 + i]
    let table = tables.get(exponent)
    if (!table) {
      const scale = Math.pow(2, exponent - 128) / 255
      table = new Uint16Array(256)
      for (let value = 0; value < 256; value++) table[value] = DataUtils.toHalfFloat(Math.min(value * scale, 65504))
      tables.set(exponent, table)
    }
    data[i * 4] = table[planes[i]]
    data[i * 4 + 1] = table[planes[count + i]]
    data[i * 4 + 2] = table[planes[count * 2 + i]]
    data[i * 4 + 3] = 15360 // Half-float 1, the original loader's alpha.
  }
  return { data, width, height }
}
