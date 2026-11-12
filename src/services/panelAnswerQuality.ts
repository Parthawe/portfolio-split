/** Reject observed cut-off replies instead of presenting fragments as finished answers. */
export function isCompletePanelAnswer(value: string): boolean {
  const text = value.trim()
  if (!text || text.length > 2200) return false
  if ((text.match(/\*\*/g)?.length || 0) % 2 || (text.match(/`/g)?.length || 0) % 2) return false
  const ending = text.replace(/[\s*`_"'’”)\]]+$/, '')
  if (!/[.!?]$/.test(ending)) return false
  return !/\b(?:and|because|the|a|an|to|of|for|with|from)[.!?]$/i.test(ending)
}
