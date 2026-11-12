import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import portfolios from './src/config/portfolios.json'

const root = '/portfolio-split'
const variant = process.env.VITE_PORTFOLIO === 'experimental' ? 'experimental' : 'product'
const other = variant === 'product' ? 'experimental' : 'product'
const base = `${root}/${variant}/`
const otherSlugs = [...portfolios[other].featured, ...portfolios[other].supporting, ...portfolios[other].archive]
const routes = new Set(['work', 'about', 'accessibility', 'mentra-website', 'project-experiences',
  ...portfolios[variant].featured, ...portfolios[variant].supporting, ...portfolios[variant].archive, ...portfolios[variant].pages])

// Both previews use one static asset directory on GitHub Pages.
function sharedAssets(html: string) {
  return html.replace(/(^|['"`(=\s])\/(Assets\/|pdf\.worker\.min\.mjs|superwhite\.mp4)/g,
    (_, lead, path) => `${lead}${root}/${path}`)
}

export default defineConfig({
  base,
  publicDir: false,
  plugins: [
    {
      name: 'preview-paths',
      enforce: 'pre',
      transformIndexHtml: { order: 'pre', handler: sharedAssets },
      transform(code, id) {
        if (!/\/src\/.*\.(?:[cm]?[jt]sx?|css|json)$/.test(id)) return
        const source = sharedAssets(code).replace(/href=(['"])\/(?!\/)([^'"]*)\1/g, (match, quote, path) => {
          if (path.startsWith('portfolio-split/')) return match
          const [pathname] = path.split(/[?#]/)
          if (otherSlugs.includes(pathname)) return `href=${quote}${root}/${other}/${path}${quote}`
          if (!pathname || routes.has(pathname) || /\/(world|prototype)$/.test(pathname)) return `href=${quote}${base}${path}${quote}`
          return `href=${quote}https://designwhich.works/${path}${quote}`
        })
        return { code: source, map: null }
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  build: {
    outDir: `dist/${variant}`,
    // 'bundle' instead of the default 'assets': public/Assets and assets/
    // collide into one directory on macOS's case-insensitive filesystem,
    // which breaks any dist built or previewed locally.
    assetsDir: 'bundle',
    chunkSizeWarningLimit: 1100,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('vite/preload-helper')) {
            return 'preload-helper'
          }

          if (!id.includes('node_modules')) return undefined

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'vendor-react'
          }

          if (id.includes('/framer-motion/')) {
            return 'vendor-motion'
          }

          if (
            id.includes('/@react-three/drei/') ||
            id.includes('/three-stdlib/') ||
            id.includes('/camera-controls/') ||
            id.includes('/maath/') ||
            id.includes('/meshline/') ||
            id.includes('/troika-three-text/') ||
            id.includes('/troika-three-utils/') ||
            id.includes('/troika-worker-utils/') ||
            id.includes('/suspend-react/') ||
            id.includes('/@react-three/fiber/') ||
            id.includes('/react-reconciler/') ||
            id.includes('/its-fine/') ||
            id.includes('/react-use-measure/')
          ) {
            return 'vendor-three-react'
          }

          // Keep the experimental WebGPU pipeline out of the default WebGL download.
          if (id.includes('/three/src/renderers/common/') || id.includes('/three/src/renderers/webgpu/') || id.includes('/three/src/renderers/webgl-fallback/') || id.includes('/three/src/nodes/') || id.includes('/three/src/materials/nodes/') || id.includes('/three/build/three.webgpu')) {
            return 'vendor-three-webgpu'
          }
          // Stage lettering belongs only to the optional scenic viewer. Keeping
          // its font and geometry out of the core avoids charging the hero for it.
          if (id.includes('/three/examples/fonts/helvetiker_') ||
              id.includes('/three/examples/jsm/loaders/FontLoader') ||
              id.includes('/three/examples/jsm/geometries/TextGeometry')) {
            return 'scenic-lettering'
          }

          if (id.includes('/three/')) {
            return 'vendor-three-core'
          }

          return undefined
        },
      },
    },
  },
})
