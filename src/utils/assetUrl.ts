/** Prefix a public asset path with the Vite base URL. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
export const asset = (path: string) => `${BASE}${path}`
