import { useRef, useState } from 'react'
import DecisionNote, { type ScreenDecision } from './DecisionNote'
import '../../styles/case-study-slides.css'

export interface CaseStudySlide {
  id: string
  src: string
  width: number
  height: number
  alt: string
  text: string
  textTruncated: boolean
  sourceUrl: string
}

export interface SlideChapter {
  id: string
  title: string
  slides: CaseStudySlide[]
}

function Slide({ slide, decision }: { slide: CaseStudySlide; decision?: ScreenDecision }) {
  const [failed, setFailed] = useState(false)
  return <figure className="case-study-slide" data-source-node={slide.id}>
    {failed ? <div className="case-study-slide__failure" role="status" style={{ aspectRatio: `${slide.width} / ${slide.height}` }}>
      <p>This slide couldn’t load.</p>
      <button type="button" onClick={() => setFailed(false)}>Retry image</button>
      <a href={slide.src} target="_blank" rel="noopener noreferrer">Open original size</a>
    </div> : <img data-project-preview data-original-src={slide.src}
      src={slide.src} srcSet={`${slide.src.replace('.webp', '-768.webp')} 768w, ${slide.src.replace('.webp', '-1280.webp')} 1280w, ${slide.src} ${slide.width}w`}
      sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) calc(100vw - 64px), 1120px"
      width={slide.width} height={slide.height} alt={slide.alt}
      loading="lazy" decoding="async" onError={() => setFailed(true)} />}
    <figcaption>
      {decision && <DecisionNote decision={decision} />}
      <div className="case-study-slide__source-actions">
      <details><summary>Read slide text</summary><p>{slide.text || 'This slide presents the original product interface.'}</p>
        {slide.textTruncated && <p>Text excerpt. <a href={slide.sourceUrl} target="_blank" rel="noopener noreferrer">Read the complete slide in Figma</a></p>}
      </details>
      <a href={slide.src} target="_blank" rel="noopener noreferrer" aria-label={`Open original size: ${slide.alt}`}>Original size ↗</a>
      </div>
    </figcaption>
  </figure>
}

function Chapter({ chapter, introduction, decisions }: { chapter: SlideChapter; introduction?: string; decisions: Record<string, ScreenDecision> }) {
  const rail = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const go = (next: number) => {
    const node = rail.current, target = node?.children[next] as HTMLElement | undefined
    if (!node || !target) return
    node.scrollTo({ left: target.offsetLeft - (node.children[0] as HTMLElement).offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section className="case-study-slides__chapter" id={chapter.id}>
    <div className="wrap">
      <header className="case-study-slides__chapter-head"><h2>{chapter.title}</h2>{introduction && <p>{introduction}</p>}</header>
      {chapter.id === 'cs-impact' && <p className="case-study-slides__note">Results are reproduced from the source presentation. First-use and runtime phases are shown separately.</p>}
      {chapter.slides.length > 1 && <div className="case-study-slides__controls"><span role="status">{index + 1} / {chapter.slides.length}</span><div><button type="button" className="glass-action" disabled={index === 0} aria-label={`Previous ${chapter.title} slide`} onClick={() => go(index - 1)}>Previous</button><button type="button" className="glass-action" disabled={index === chapter.slides.length - 1} aria-label={`Next ${chapter.title} slide`} onClick={() => go(index + 1)}>Next</button></div></div>}
      <div className="case-study-slides__images" ref={rail} tabIndex={chapter.slides.length > 1 ? 0 : undefined} aria-label={`${chapter.title}, original presentation`} onKeyDown={event => {
        if (event.target !== event.currentTarget || !['ArrowRight', 'ArrowLeft'].includes(event.key)) return
        event.preventDefault(); go(Math.max(0, Math.min(chapter.slides.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1))))
      }} onScroll={() => {
        const node = rail.current
        if (!node || !node.children.length) return
        const start = (node.children[0] as HTMLElement).offsetLeft
        let nearest = 0, distance = Infinity
        Array.from(node.children).forEach((child, i) => { const d = Math.abs((child as HTMLElement).offsetLeft - start - node.scrollLeft); if (d < distance) { nearest = i; distance = d } })
        setIndex(nearest)
      }}>{chapter.slides.map(slide => <Slide key={slide.id} slide={slide} decision={decisions[slide.id]} />)}</div>
    </div>
  </section>
}
export default function CaseStudySlides({ chapters, introductions = {}, decisions = {} }: { chapters: SlideChapter[]; introductions?: Record<string, string>; decisions?: Record<string, ScreenDecision> }) {
  return <div className="case-study-slides">{chapters.filter(chapter => chapter.slides.length > 0).map(chapter => <Chapter key={chapter.id} chapter={chapter} introduction={introductions[chapter.id]} decisions={decisions} />)}</div>
}
