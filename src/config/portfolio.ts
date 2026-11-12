import portfolios from './portfolios.json'

export const isExperimental = import.meta.env.VITE_PORTFOLIO === 'experimental'
export const portfolio = isExperimental ? portfolios.experimental : portfolios.product
export const sibling = isExperimental ? portfolios.product : portfolios.experimental
export const previewRoot = '/portfolio-split'
export const siblingHome = `${previewRoot}/${isExperimental ? 'product' : 'experimental'}/`
export const projectSlugs = [...portfolio.featured, ...portfolio.supporting, ...portfolio.archive]
export const siblingSlugs = [...sibling.featured, ...sibling.supporting, ...sibling.archive]
