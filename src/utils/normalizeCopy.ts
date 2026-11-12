export function normalizeCopy(text: string): string {
  return text
    .replace(/([A-Za-z0-9])\s*–\s*([A-Za-z0-9])/g, '$1-$2')
    .replace(/(\d)\s*–\s*(\d)/g, '$1-$2')
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function normalizeCopyList(items: string[]): string[] {
  return items.map(normalizeCopy)
}
