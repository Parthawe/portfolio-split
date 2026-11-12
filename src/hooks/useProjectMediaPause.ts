import { useEffect } from 'react'

/** Pause project films when reading moves away. Playback resumes only on user request. */
export function useProjectMediaPause(route: string) {
  useEffect(() => {
    const main = document.querySelector('.project-main')
    if (!main) return
    const videos = new Set<HTMLVideoElement>()
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (!entry.isIntersecting) (entry.target as HTMLVideoElement).pause() })
    })
    const scan = () => main.querySelectorAll('video').forEach(video => {
      if (!videos.has(video)) { videos.add(video); observer.observe(video) }
    })
    const hide = () => { if (document.hidden) videos.forEach(video => video.pause()) }
    scan()
    const mutations = new MutationObserver(scan)
    mutations.observe(main, { childList: true, subtree: true })
    document.addEventListener('visibilitychange', hide)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      document.removeEventListener('visibilitychange', hide)
      videos.forEach(video => video.pause())
    }
  }, [route])
}
