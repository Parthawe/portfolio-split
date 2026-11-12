// Pack cards into one-pixel grid rows without changing DOM or keyboard order.
export function packCardGrid(grid: HTMLElement | null) {
  if (!grid || typeof ResizeObserver === 'undefined') return
  const observer = new ResizeObserver(entries => {
    const gap = parseFloat(getComputedStyle(grid).columnGap)
    for (const entry of entries) {
      const card = entry.target as HTMLElement
      const height = entry.borderBoxSize?.[0]?.blockSize ?? card.offsetHeight
      const rows = String(Math.ceil(height + gap))
      if (card.style.getPropertyValue('--card-rows') !== rows) {
        card.style.setProperty('--card-rows', rows)
      }
    }
    grid.dataset.packed = ''
  })
  for (const card of grid.children) observer.observe(card, { box: 'border-box' })
  return () => {
    observer.disconnect()
    delete grid.dataset.packed
  }
}
