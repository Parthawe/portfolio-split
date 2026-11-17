import portfolios from './portfolios.json'

export const isExperimental = import.meta.env.VITE_PORTFOLIO === 'experimental'
export const portfolio = isExperimental ? portfolios.experimental : portfolios.product
export const previewRoot = '/portfolio-split'
export const projectSlugs = [...portfolio.featured, ...portfolio.supporting, ...portfolio.archive]
