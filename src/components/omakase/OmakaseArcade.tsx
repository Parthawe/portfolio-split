import { useEffect, useRef, useState } from 'react'
import { omakaseGame, omakasePlayers } from './game'
import './omakase.css'

/** The original, cross-origin Unity build owns input and gameplay. No simulated controls. */
export default function OmakaseArcade() {
  const [running, setRunning] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<'loading' | 'opened' | 'slow' | 'error'>('loading')
  const [fullscreen, setFullscreen] = useState(false)
  const [message, setMessage] = useState('')
  const cabinet = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const start = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const change = () => setFullscreen(document.fullscreenElement === cabinet.current)
    document.addEventListener('fullscreenchange', change)
    return () => document.removeEventListener('fullscreenchange', change)
  }, [])
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setStatus(current => current === 'loading' ? 'slow' : current), 25000)
    return () => window.clearTimeout(timer)
  }, [running, attempt])
  async function expand() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (cabinet.current?.requestFullscreen) await cabinet.current.requestFullscreen()
      else setMessage('Fullscreen is unavailable in this browser. Open the hosted game for a larger view.')
    } catch { setMessage('Fullscreen was unavailable. You can open the hosted game in a separate tab.') }
  }
  function stop() {
    setRunning(false)
    setMessage('Game stopped. Start again to load a fresh session.')
    if (document.fullscreenElement === cabinet.current) void document.exitFullscreen().catch(() => {})
    window.setTimeout(() => start.current?.focus(), 0)
  }
  return <section className="om-arcade" aria-label="The Omakase arcade">
    <div className="om-intro"><p>Two chefs. One conveyor belt.</p><p>Drop sushi, reverse the belt and serve the right customer. Bring a second player and share a keyboard.</p></div>
    <div className="om-cabinet" ref={cabinet}>
      {fullscreen && <button className="om-exit" onClick={expand}>Exit fullscreen</button>}
      <div className="om-marquee"><span aria-hidden="true">●</span><strong>THE OMAKASE.</strong><small>2 PLAYER ARCADE</small></div>
      <div className="om-bezel"><div className="om-screen">
        {running ? <iframe key={attempt} ref={frame} src={omakaseGame.embed} title="The Omakase original Unity game" allow="autoplay; fullscreen" allowFullScreen onLoad={() => setStatus('opened')} onError={() => setStatus('error')} /> : <>
          <img src="/Assets/Projects/the-omakase/photos/game-screen-sushi.webp" alt="Original Omakase sushi conveyor game" />
          <div className="om-start"><button ref={start} onClick={() => { setStatus('loading'); setMessage(''); setRunning(true) }}>Start original game <span aria-hidden="true">↗</span></button><span>Original Unity build · keyboard required</span></div>
        </>}
      </div></div>
      <div className="om-control-deck" aria-label="Keyboard controls for both players">
        {omakasePlayers.map(player => <div className="om-player" key={player.name}><h2>{player.name}</h2><div className="om-keys" aria-label="Customer keys">{[player.drop, ...player.upper, player.reverse, ...player.lower].map(key => <kbd key={key}>{key}</kbd>)}</div><p><kbd>{player.drop}</kbd> Drop sushi <span> / </span><kbd>{player.reverse}</kbd> Reverse belt</p></div>)}
      </div>
      <div className="om-cabinet-footer"><span>Local multiplayer / 16 cabinet buttons</span><span>Unity + Arduino in the physical build</span></div>
    </div>
    <div className="om-session"><p role="status">{message || (running ? status === 'loading' ? 'Opening the hosted game…' : status === 'error' ? 'The hosted game could not load. Reload it or open the original on itch.io.' : status === 'slow' ? 'The game may still be loading. Use its loading bar; if it stalls, reload or open itch.io.' : 'Hosted page opened. Unity has its own loading bar. Click inside the screen to give the game keyboard focus.' : 'The game loads only when you start it. On phones and tablets, connect a hardware keyboard to play.')}</p><div>
      {running && <><button onClick={() => frame.current?.focus()}>Focus game</button><button onClick={expand}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button><button onClick={() => { setStatus('loading'); setMessage(''); setAttempt(value => value + 1) }}>Reload game</button><button onClick={stop}>Stop game</button></>}
      <a href={omakaseGame.page} target="_blank" rel="noopener noreferrer">Play on itch.io ↗</a>
    </div></div>
    <details className="om-rules"><summary>How to play & keyboard layout</summary><p>Drop the next sushi onto the belt. Match it to a customer’s order as it passes, then press that customer’s key. White outfits score for P1; black outfits score for P2. Serving the wrong sushi deducts five points from that customer’s player. Either chef can serve either player’s customers.</p><p>The outer two customer keys in each row are used for a four-customer layout. All three are used for a six-customer layout. Reversing the belt has a five-second cooldown. The physical RGB buttons change with the game; the keyboard legend here stays static.</p><a href={omakaseGame.page} target="_blank" rel="noopener noreferrer">Original instructions and credits ↗</a></details>
    <details className="om-evidence"><summary>Compare with the original cabinet</summary><div><figure><img loading="lazy" src="/Assets/Projects/the-omakase/photos/cabinet-front.webp" alt="Original plywood arcade cabinet with two sets of eight buttons"/><figcaption>The original cabinet. The browser presentation keeps the screen flat for play.</figcaption></figure><figure><img loading="lazy" src="/Assets/Projects/the-omakase/photos/two-players.webp" alt="Two players using The Omakase cabinet"/><figcaption>Two players share the physical controls.</figcaption></figure></div></details>
  </section>
}
