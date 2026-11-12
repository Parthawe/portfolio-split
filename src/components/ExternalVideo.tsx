import { useEffect, useRef, useState, type IframeHTMLAttributes } from 'react'
import { projectFilms } from '../data/projectFilms'
import { projectFilmCaptions } from '../data/projectFilmCaptions'

type Props = IframeHTMLAttributes<HTMLIFrameElement> & {
  poster?: string
  fallbackLabel?: string
}

const filmPosters: Record<string, string> = {
  '1091963037': 'breakgen',
  '996020990': 'the-omakase',
  '996020149': 'jugalbandi',
  '895893649': 'enigma',
  '897796834': 'shuffle',
  '1026164956': 'drowning',
  '996025152': 'moniac-machine',
  '1010457989': 'making-of-time',
}

function LocalProjectFilm({ slug, title, watchUrl, poster, silent = false }: { slug: string; title: string; watchUrl: string; poster?: string; silent?: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const captions = projectFilmCaptions[slug]
  return (
    <div className="external-video local-project-film">
      <video ref={video} controls playsInline muted={silent} preload="none" poster={poster || `/Assets/mockups/projects/${slug}_16x9.webp`}
        aria-label={title} data-caption-status={captions ? 'automatic' : undefined} onError={() => setFailed(true)}>
        <source src={`/Assets/films/${slug}.mp4`} type="video/mp4" onError={() => setFailed(true)} />
        {captions && <track kind="captions" src={captions.src} srcLang={captions.language} label="Automatic captions" default />}
      </video>
      <div className="local-project-film__links">
        {silent && <span className="external-video-fallback">Silent film</span>}
        {captions && <a href={captions.src} download className="external-video-fallback" aria-label={`Download automatic captions for ${title}`}>Automatic captions ↓</a>}
        <a href={watchUrl} target="_blank" rel="noreferrer" className="external-video-fallback" aria-label={`Watch ${title} on Vimeo in a separate tab`}>Watch on Vimeo ↗</a>
      </div>
      {failed && <div className="external-video__status" role="status">
        This film could not load. You can watch on Vimeo or retry here.
        <button type="button" onClick={() => { setFailed(false); video.current?.load() }}>Reload film</button>
      </div>}
    </div>
  )
}

function VimeoPlayer({ src, title = 'Project film', poster, ...props }: Props) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'slow' | 'error'>('idle')
  const [attempt, setAttempt] = useState(0)
  const url = new URL(src!)
  const id = url.pathname.split('/').pop()
  const preview = poster || (id && filmPosters[id] ? `/Assets/mockups/projects/${filmPosters[id]}_16x9.webp` : undefined)
  const hash = url.searchParams.get('h')
  const watchUrl = `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`
  url.searchParams.set('dnt', '1')
  url.searchParams.set('autoplay', '1')
  const embedUrl = url.toString()

  const active = status !== 'idle'
  useEffect(() => {
    if (!active) return
    const receive = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vimeo.com' || event.source !== frame.current?.contentWindow) return
      let data = event.data
      if (typeof data === 'string') {
        try { data = JSON.parse(data) } catch { return }
      }
      if (data?.event === 'ready' || data?.method === 'ping') {
        setStatus('ready')
        frame.current?.contentWindow?.postMessage({ method: 'addEventListener', value: 'error' }, event.origin)
      }
      if (data?.event === 'error') setStatus('error')
    }
    window.addEventListener('message', receive)
    const timer = window.setTimeout(() => setStatus(current => current === 'loading' ? 'slow' : current), 15000)
    return () => { window.removeEventListener('message', receive); window.clearTimeout(timer) }
  }, [active, attempt])

  return (
    <div className="external-video" data-player-state={status}>
      {status === 'idle' ? <>
        {preview && <img className="external-video__poster" src={preview} alt="" loading="lazy" />}
        <button type="button" className="external-video__play" onClick={() => setStatus('loading')}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          <span>Play {title}</span>
        </button>
      </> : <iframe {...props} key={attempt} ref={frame} src={embedUrl} title={title} allowFullScreen
        onLoad={event => {
          frame.current?.contentWindow?.postMessage({ method: 'ping' }, 'https://player.vimeo.com')
          props.onLoad?.(event)
        }} />}
      {(status === 'loading' || status === 'slow' || status === 'error') && <div className="external-video__status" role="status">
        {status === 'loading' ? 'Loading film…' : status === 'slow' ? 'The player is taking longer than expected. You can watch on Vimeo.' : 'The embedded player could not play this film. Try Vimeo or retry here.'}
        {status === 'error' && <button type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1) }}>Retry player</button>}
      </div>}
      <a href={watchUrl} target="_blank" rel="noreferrer" className="external-video-fallback"
        aria-label={`Watch ${title} on Vimeo in a separate tab`}>Watch on Vimeo ↗</a>
    </div>
  )
}

/** Prefer the local final edit; external-only films load on request. */
export default function ExternalVideo({ poster, fallbackLabel = 'Open media', ...props }: Props) {
  if (props.src?.startsWith('https://player.vimeo.com/video/')) {
    const url = new URL(props.src)
    const id = url.pathname.split('/').pop() || ''
    const film = projectFilms[id]
    if (film) {
      const hash = url.searchParams.get('h')
      const watchUrl = `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`
      return <LocalProjectFilm key={film.slug} slug={film.slug} title={props.title || 'Project film'} watchUrl={watchUrl} poster={poster} silent={film.silent} />
    }
    return <VimeoPlayer key={props.src} {...props} poster={poster} />
  }
  return <>
    <iframe {...props} />
    <a href={props.src} target="_blank" rel="noreferrer" className="external-video-fallback"
      aria-label={`${fallbackLabel} in a separate tab`}>{fallbackLabel} ↗</a>
  </>
}
