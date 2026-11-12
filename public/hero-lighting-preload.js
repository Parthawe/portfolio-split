// Start only the homepage's lighting fetch while the application modules load.
// Keep these device guards aligned with src/utils/performance.ts.
(function () {
  if (location.pathname !== '/' || new URLSearchParams(location.search).has('p')) return
  if (document.documentElement.classList.contains('is-low-power-device') || document.querySelector('link[data-hero-environment]')) return
  var nav = navigator
  var coarse = matchMedia('(hover: none), (pointer: coarse)').matches
  var memory = nav.deviceMemory, cores = nav.hardwareConcurrency
  if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      matchMedia('(max-width: 768px)').matches || (coarse && innerWidth <= 1180) ||
      (typeof memory === 'number' && memory <= 2) ||
      (typeof cores === 'number' && cores <= 2) ||
      (typeof memory === 'number' && memory <= 4 && typeof cores === 'number' && cores <= 4) ||
      (nav.connection && nav.connection.saveData) ||
      new URLSearchParams(location.search).get('perf') === 'emergency') return
  try { if (sessionStorage.getItem('portfolio-performance-mode') === 'forced') return } catch (_) {}
  try {
    var canvas = document.createElement('canvas')
    var gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    window.__portfolioWebGLAvailable = !!gl
    if (!gl) return
    var release = gl.getExtension('WEBGL_lose_context')
    if (release) release.loseContext()
  } catch (_) { return }
  if (document.querySelector('link[data-hero-environment]')) return
  var link = document.createElement('link')
  link.dataset.heroEnvironment = ''
  link.rel = 'preload'
  link.as = 'fetch'
  link.href = typeof DecompressionStream === 'function'
    ? '/Assets/hdri/potsdamer_platz_1k.rgbe.gz'
    : '/Assets/hdri/potsdamer_platz_1k.hdr'
  link.crossOrigin = 'anonymous'
  link.fetchPriority = 'high'
  document.head.append(link)
})()
