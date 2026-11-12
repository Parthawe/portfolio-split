/** Centralized site-wide constants. Single source of truth for SEO, metadata, and branding. */

import { portfolio, previewRoot } from './portfolio'

export const SITE_NAME = portfolio.name
/**
 * Origin that actually serves the deployed site. Every canonical, OG, and
 * schema URL derives from these values.
 */
export const SITE_ORIGIN = 'https://parthawe.github.io'
export const SITE_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
/** Absolute prefix for page routes. The router basename strips SITE_BASE from pathnames. */
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}`
export const DEFAULT_OG_IMAGE = previewRoot + portfolio.shareImage
export const DEFAULT_DESCRIPTION = portfolio.description
export const DEFAULT_OG_IMAGE_ALT = portfolio.shareImageAlt
export const THEME_COLOR_LIGHT = '#FAFAF8'
export const THEME_COLOR_DARK = '#111110'
export const CONTACT_EMAIL = 'parthpawar@nyu.edu'
export const RESUME_URL = '/Assets/Application_Resume.pdf'
