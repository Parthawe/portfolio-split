/** Match named time zones, not UTC offsets, so daylight saving stays correct. */
export function getVisitorLocation(timeZone?: string) {
  let zone = timeZone
  if (!zone) {
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { zone = '' }
  }
  const eastern = new Set(['America/New_York', 'US/Eastern', 'America/Detroit', 'US/Michigan', 'America/Toronto', 'Canada/Eastern', 'America/Nassau', 'America/Indiana/Indianapolis', 'America/Indianapolis', 'US/East-Indiana', 'America/Indiana/Marengo', 'America/Indiana/Vevay', 'America/Indiana/Petersburg', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Kentucky/Louisville', 'America/Louisville', 'America/Kentucky/Monticello'])
  const pacific = new Set(['America/Los_Angeles', 'US/Pacific', 'US/Pacific-New', 'America/Vancouver', 'Canada/Pacific', 'America/Tijuana'])
  if (eastern.has(zone || '')) return { label: 'New York, NY', clockLabel: 'ET' }
  if (pacific.has(zone || '')) return { label: 'San Francisco, CA', clockLabel: 'PT' }
  return { label: 'United States', clockLabel: 'your local time' }
}
