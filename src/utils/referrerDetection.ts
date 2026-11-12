const STORAGE_KEY = 'folio-referrer-info'

export interface ReferrerInfo {
  referrer: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

let cached: ReferrerInfo | null = null

export function getReferrerInfo(): ReferrerInfo {
  if (cached) return cached

  // Check sessionStorage first (persists across routes)
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      cached = JSON.parse(stored)
      return cached!
    }
  } catch {}

  // First load — read from browser
  const params = new URLSearchParams(window.location.search)
  const info: ReferrerInfo = {
    referrer: document.referrer || '',
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  }

  // Persist for the session
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info))
  } catch {}

  cached = info
  return info
}
