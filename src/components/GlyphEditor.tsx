import { useEffect, useId, useMemo, useRef, useState } from 'react'
import opentype, { type Font, type PathCommand } from 'opentype.js'
import PortfolioSlider from './PortfolioSlider'
import CompactSheet from './CompactSheet'
import '../styles/type-workshop.css'

type Field = 'x' | 'y' | 'x1' | 'y1' | 'x2' | 'y2'
type Handle = { index: number; x: Field; y: Field; name: string }
const fonts = [
  { label: 'Ultralight', weight: 200, url: "/Assets/Projects/Typeface/butlers-slice/Butler's_Slice-UltraLight.otf" },
  { label: 'Regular', weight: 400, url: "/Assets/Projects/Typeface/butlers-slice/Butler's_Slice.otf" },
  { label: 'Bold', weight: 700, url: "/Assets/Projects/Typeface/butlers-slice/Butler's_Slice-Bold.otf" },
]
const copy = (commands: PathCommand[]) => commands.map(command => ({ ...command }))
const value = (command: PathCommand, field: Field) => (command as unknown as Record<Field, number>)[field]
const pathData = (commands: PathCommand[]) => { const path = new opentype.Path(); path.commands = commands; return path.toPathData(3) }
const xml = (text: string) => text.replace(/[<>&"']/g, char => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[char]!))

export default function GlyphEditor({ workshop = false }: { workshop?: boolean }) {
  const id = useId()
  const [fontIndex, setFontIndex] = useState(1)
  const [font, setFont] = useState<Font | null>(null)
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [text, setText] = useState('Butler’s Slice')
  const [size, setSize] = useState(72)
  const [char, setChar] = useState(workshop ? 'B' : 'A')
  const [commands, setCommands] = useState<PathCommand[]>([])
  const [original, setOriginal] = useState<PathCommand[]>([])
  const [selected, setSelected] = useState<Handle | null>(null)
  const [showFill, setShowFill] = useState(true)
  const [showPoints, setShowPoints] = useState(true)
  const [attached,setAttached]=useState(true)
  const [metrics,setMetrics]=useState(false)
  const [message, setMessage] = useState('')
  const svg = useRef<SVGSVGElement>(null)
  const fontCache=useRef<Record<number,Font>>({})
  const saved = useRef<Record<string, PathCommand[]>>({})
  const history = useRef<Record<string, { undo: PathCommand[][]; redo: PathCommand[][] }>>({})
  const key = `${fontIndex}:${char}`
  const [sheet, setSheet] = useState(false)
  const [mode, setMode] = useState<'Glyph' | 'Specimen'>('Glyph')
  const sheetButton = useRef<HTMLButtonElement>(null)
  const [pointIndex, setPointIndex] = useState(0)
  const remember = () => {
    const entry = history.current[key] ??= { undo: [], redo: [] }
    entry.undo = [...entry.undo.slice(-39), copy(commands)]; entry.redo = []
  }
  const commit = (next: PathCommand[]) => { saved.current[key] = copy(next); setCommands(next) }
  const restore = (direction: 'undo' | 'redo') => {
    const entry = history.current[key], next = entry?.[direction].pop()
    if (!next) return
    entry[direction === 'undo' ? 'redo' : 'undo'].push(copy(commands))
    commit(copy(next)); setMessage(direction === 'undo' ? 'Edit undone.' : 'Edit restored.')
  }
  const chooseChar = (next: string) => { if(next !== char) { setLoading(true); setPointIndex(0); setChar(next) } }

  const drag = useRef<{ handle: Handle; pointer: number } | null>(null)
  const [view, setView] = useState({ x: 0, y: 0, w: 800, h: 800 })
  useEffect(() => {
    const abort = new AbortController()
    setLoading(true); setFont(null); drag.current = null; setSelected(null)
    if(fontCache.current[fontIndex]) { setFont(fontCache.current[fontIndex]); return () => abort.abort() }
    fetch(fonts[fontIndex].url, { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('Font unavailable')
      return response.arrayBuffer()
    }).then(data => { if (!abort.signal.aborted) { fontCache.current[fontIndex]=opentype.parse(data);setFont(fontCache.current[fontIndex]) } })
      .catch(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [fontIndex, retry])
  useEffect(() => {
    if (!font) return
    const path = font.charToGlyph(char).getPath(100, 650, 600)
    setCommands(copy(saved.current[key] ?? path.commands)); setOriginal(copy(path.commands)); setSelected(null); drag.current = null; setMessage('')
    const b = path.getBoundingBox()
    setView({ x: b.x1 - 80, y: b.y1 - 80, w: Math.max(160, b.x2 - b.x1 + 160), h: Math.max(160, b.y2 - b.y1 + 160) })
    setLoading(false)
  }, [font, char])
  const d = useMemo(() => pathData(commands), [commands])
  const edited = d !== pathData(original)
  const handles = useMemo(() => commands.flatMap((command, index) => {
    if (command.type === 'Z') return []
    const result: Handle[] = [{ index, x: 'x', y: 'y', name: `Anchor point ${index}` }]
    if (command.type === 'C' || command.type === 'Q') result.push({ index, x: 'x1', y: 'y1', name: `Control point 1 for point ${index}` })
    if (command.type === 'C') result.push({ index, x: 'x2', y: 'y2', name: `Control point 2 for point ${index}` })
    return result
  }), [commands])
  const move = (handle: Handle, x: number, y: number, snapshot = true) => {
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x)>10000 || Math.abs(y)>10000) return
    if(snapshot) remember()
    const next=copy(commands),command=next[handle.index] as unknown as Record<string,number|string>
    const dx=x-value(commands[handle.index],handle.x),dy=y-value(commands[handle.index],handle.y)
    command[handle.x]=x;command[handle.y]=y
    if(attached&&handle.x==='x'){
      if(next[handle.index].type==='C'){command.x2=Number(command.x2)+dx;command.y2=Number(command.y2)+dy}
      const following=next[handle.index+1] as unknown as Record<string,number|string>|undefined
      if(following&&(following.type==='C'||following.type==='Q')){following.x1=Number(following.x1)+dx;following.y1=Number(following.y1)+dy}
    }
    if(attached&&handle.x==='x'){
      let start=handle.index;while(start>0&&commands[start].type!=='M')start--
      let end=start+1;while(end<commands.length&&commands[end].type!=='Z'&&commands[end].type!=='M')end++
      const last=end-1
      if(commands[end]?.type==='Z'&&last>start&&Math.abs(value(commands[last],'x')-value(commands[start],'x'))<.001&&Math.abs(value(commands[last],'y')-value(commands[start],'y'))<.001){
        const counterpart=handle.index===start?last:handle.index===last?start:-1
        if(counterpart>=0){const other=next[counterpart] as unknown as Record<string,number|string>;other.x=Number(other.x)+dx;other.y=Number(other.y)+dy
          if(counterpart===last&&other.type==='C'){other.x2=Number(other.x2)+dx;other.y2=Number(other.y2)+dy}
          if(counterpart===start){const curve=next[start+1] as unknown as Record<string,number|string>;if(curve?.type==='C'||curve?.type==='Q'){curve.x1=Number(curve.x1)+dx;curve.y1=Number(curve.y1)+dy}}
        }
      }
    }
    commit(next)
  }

  const fitOutline = (outline = commands) => {
    const path = new opentype.Path(); path.commands = outline
    const bounds = path.getBoundingBox()
    setView({ x: bounds.x1 - 80, y: bounds.y1 - 80, w: Math.max(160,bounds.x2-bounds.x1+160), h: Math.max(160,bounds.y2-bounds.y1+160) })
  }
  const reset = () => { remember(); commit(copy(original)); fitOutline(original); setMessage('Glyph restored. Undo is available.') }
  const layout = (source: string, fontSize: number) => {
    if (!font) return null
    let pen = 0
    let previous: ReturnType<Font['charToGlyph']> | undefined
    const paths: string[] = []
    let x1 = 0, y1 = -fontSize, x2 = 0, y2 = fontSize * .3
    for (const letter of Array.from(source)) {
      const glyph = font.charToGlyph(letter)
      if (previous) pen += font.getKerningValue(previous, glyph) * fontSize / font.unitsPerEm
      const retained = letter === char ? commands : saved.current[`${fontIndex}:${letter}`]
      if (retained) {
        const outline = new opentype.Path(); outline.commands = retained
        const bounds = outline.getBoundingBox(), scale = fontSize / 600
        x1 = Math.min(x1, pen + (bounds.x1 - 100) * scale); x2 = Math.max(x2, pen + (bounds.x2 - 100) * scale)
        y1 = Math.min(y1, (bounds.y1 - 650) * scale); y2 = Math.max(y2, (bounds.y2 - 650) * scale)
        paths.push(`<g transform="translate(${pen} 0) scale(${scale}) translate(-100 -650)"><path d="${pathData(retained)}"/></g>`)
      } else {
        const path = glyph.getPath(pen, 0, fontSize), bounds = path.getBoundingBox()
        x1 = Math.min(x1, bounds.x1); x2 = Math.max(x2, bounds.x2)
        y1 = Math.min(y1, bounds.y1); y2 = Math.max(y2, bounds.y2)
        paths.push(`<path d="${path.toPathData(3)}"/>`)
      }
      pen += (glyph.advanceWidth ?? font.unitsPerEm) * fontSize / font.unitsPerEm
      previous = glyph
    }
    const pad = 16, width = Math.max(pen, x2) - x1 + pad * 2, height = y2 - y1 + pad * 2
    return { body: paths.join(''), width, height, viewBox: `${x1 - pad} ${y1 - pad} ${width} ${height}` }
  }
  const exportSvg = () => {
    const source = workshop ? text : char
    if (!source.trim()) { setMessage('Type a specimen before exporting.'); return }
    const specimen = layout(source, size)
    if (!specimen) return
    const documentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${specimen.viewBox}"><title>${xml(source)} · Butler’s Slice ${fonts[fontIndex].label}</title><g fill="black">${specimen.body}</g></svg>`
    const url = URL.createObjectURL(new Blob([documentSvg], { type: 'image/svg+xml' }))
    const link = document.createElement('a'); link.href = url; link.download = `butlers-slice-${fonts[fontIndex].label.toLowerCase()}.svg`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('SVG exported with vector outlines and all retained glyph edits in this weight.')
  }
  const previewPath = font && text.trim() ? layout(text, size) : null
  // SVG strings above contain only numeric font paths, never interpolated user markup.
  const radius = Math.max(view.w, view.h) * .014
  const inspector = (suffix: string) => <div className="tw-inspector-content">
    <label htmlFor={`${id}-${suffix}-weight`}>Font weight</label><select id={`${id}-${suffix}-weight`} value={fontIndex} onChange={event => { setLoading(true); setFontIndex(Number(event.target.value)); setPointIndex(0) }}>{fonts.map((item,index)=><option key={item.label} value={index}>{item.label}</option>)}</select>
    <div className="tw-tool-row"><button className="tw-action" aria-pressed={showFill} onClick={()=>setShowFill(!showFill)}>Fill</button><button className="tw-action" aria-pressed={showPoints} onClick={()=>setShowPoints(!showPoints)}>Points</button><button className="tw-action" disabled={!font||loading} onClick={()=>fitOutline()}>Fit outline</button></div>
    <label htmlFor={`${id}-${suffix}-point`}>Selected point</label><select id={`${id}-${suffix}-point`} value={selected ? handles.findIndex(handle=>handle.index===selected.index&&handle.x===selected.x) : -1} onChange={event=>{const index=Number(event.target.value);setPointIndex(index);setSelected(handles[index]??null)}}><option value={-1}>Choose a point</option>{handles.map((handle,index)=><option key={`${handle.index}-${handle.x}`} value={index}>{handle.name}</option>)}</select>
    {selected && commands[selected.index] && <div className="tw-coordinates">{(['x','y'] as const).map(axis=><label key={axis}>{axis.toUpperCase()}<input type="number" min={-10000} max={10000} aria-label={`Selected point ${axis.toUpperCase()}`} value={Math.round(value(commands[selected.index],selected[axis])*10)/10} onChange={event=>{if(!event.target.value)return; const c=commands[selected.index];move(selected,axis==='x'?Number(event.target.value):value(c,selected.x),axis==='y'?Number(event.target.value):value(c,selected.y))}}/></label>)}</div>}
    <label className="tw-check"><input type="checkbox" checked={attached} onChange={event=>setAttached(event.target.checked)}/> Move attached handles with anchors</label><label className="tw-check"><input type="checkbox" checked={metrics} onChange={event=>setMetrics(event.target.checked)}/> Show measured glyph guides</label><button className="tw-action" disabled={!edited||loading} onClick={reset}>Reset glyph</button>
    <details><summary>Choose another glyph</summary><div className="ge-chars" aria-label="Choose a glyph">{Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!').map(letter=><button className="ge-char-btn" aria-pressed={letter===char} key={letter} onClick={()=>chooseChar(letter)}>{letter}</button>)}</div></details>
    <p className="ge-hint">Drag a point or focus the canvas and use arrow keys. Shift moves ten units. Use [ and ] to select another point. Edits are retained separately for each character and weight.</p>
  </div>
  return <section className={`glyph-editor tw-editor ${workshop ? 'tw-editor--workshop' : ''}`} aria-label="Glyph workshop" onKeyDown={event=>{if(!(event.target instanceof HTMLInputElement&&event.target.type==='text')&&(event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='z'){event.preventDefault();restore(event.shiftKey?'redo':'undo')}}}>
    <div className="wrap">
      <div className="tw-toolbar">
        <label htmlFor={`${id}-char`}>Character<input id={`${id}-char`} className="ge-char-input" value={char} onChange={event=>{const letters=Array.from(event.target.value);if(letters.length)chooseChar(letters[letters.length-1])}}/></label>
        {workshop && <div className="glass-segments" role="group" aria-label="Workshop view">{(['Glyph','Specimen'] as const).map(item=><button key={item} aria-pressed={mode===item} onClick={()=>setMode(item)}>{item}</button>)}</div>}
        <div className="tw-tool-row"><button className="tw-action" disabled={!history.current[key]?.undo.length||loading} onClick={()=>restore('undo')}>Undo</button><button className="tw-action" disabled={!history.current[key]?.redo.length||loading} onClick={()=>restore('redo')}>Redo</button></div>
        <button className="tw-action tw-mobile-inspect" ref={sheetButton} onClick={()=>setSheet(true)}>Inspector</button>
        <button className="tw-action" disabled={!font||loading} onClick={exportSvg}>Export {workshop ? 'specimen' : 'glyph'} SVG</button>
      </div>
      <div className="tw-workspace">
        <div className="tw-artifact">
          {loading ? <div className="tw-state" role="status">Loading the original {fonts[fontIndex].label.toLowerCase()} font…</div> : !font ? <div className="tw-state" role="alert"><p>The original font could not be loaded.</p><button className="tw-action" onClick={()=>setRetry(old=>old+1)}>Retry font</button></div> : mode==='Specimen' && workshop ? <div className="tw-preview" aria-label="Live type specimen">{previewPath ? <svg width={previewPath.width} height={previewPath.height} viewBox={previewPath.viewBox} role="img" aria-label={text}><g fill="currentColor" dangerouslySetInnerHTML={{__html:previewPath.body}}/></svg> : <p>Type something to begin.</p>}</div> : <div className="ge-canvas-wrap"><svg ref={svg} className="ge-svg tw-svg" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} tabIndex={0} role="group" aria-label={`Editable ${char} outline`} onKeyDown={event=>{
            if(handles.length&&(event.key==='['||event.key===']')){event.preventDefault();const index=(pointIndex+(event.key===']'?1:-1)+handles.length)%handles.length;setPointIndex(index);setSelected(handles[index]??null);return}
            const handle=selected??handles[pointIndex];if(!handle)return
            const delta=event.shiftKey?10:1,keys:Record<string,[number,number]>={ArrowLeft:[-delta,0],ArrowRight:[delta,0],ArrowUp:[0,-delta],ArrowDown:[0,delta]}
            if(keys[event.key]){event.preventDefault();setSelected(handle);move(handle,value(commands[handle.index],handle.x)+keys[event.key][0],value(commands[handle.index],handle.y)+keys[event.key][1])}
          }} onPointerDown={event=>{
            if(drag.current||!showPoints||!svg.current)return
            const matrix=svg.current.getScreenCTM();if(!matrix)return
            let nearest:Handle|undefined,closest=22
            for(const handle of handles){const point=new DOMPoint(value(commands[handle.index],handle.x),value(commands[handle.index],handle.y)).matrixTransform(matrix),distance=Math.hypot(point.x-event.clientX,point.y-event.clientY);if(distance<closest){closest=distance;nearest=handle}}
            if(nearest){event.preventDefault();remember();svg.current.focus();setSelected(nearest);drag.current={handle:nearest,pointer:event.pointerId};event.currentTarget.setPointerCapture(event.pointerId)}
          }} onPointerMove={event=>{if(!drag.current||drag.current.pointer!==event.pointerId||!svg.current)return;const matrix=svg.current.getScreenCTM();if(!matrix)return;const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());move(drag.current.handle,point.x,point.y,false)}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onLostPointerCapture={()=>{drag.current=null}}>
            <line x1={view.x} x2={view.x+view.w} y1={650} y2={650} stroke="var(--ink-15)"/>{metrics&&font&&<g aria-hidden="true">{[['H top',font.charToGlyph('H').getPath(100,650,600).getBoundingBox().y1],['x top',font.charToGlyph('x').getPath(100,650,600).getBoundingBox().y1],['Baseline',650]].map(([name,y])=><g key={String(name)}><line x1={view.x} x2={view.x+view.w} y1={Number(y)} y2={Number(y)} stroke="var(--ink-30)" strokeDasharray="5 5"/><text x={view.x+8} y={Number(y)-6} fill="var(--ink)" fontSize={view.w*.025}>{name}</text></g>)}</g>}
            <path data-glyph-outline data-font={fonts[fontIndex].label} d={d} fill={showFill?'var(--ink-08)':'none'} stroke="var(--ink)" strokeWidth={1.5}/>
            {showPoints && handles.map(handle=>{const command=commands[handle.index],x=value(command,handle.x),y=value(command,handle.y);return <g key={`${handle.index}-${handle.x}`}>
              {handle.x!=='x'&&<line x1={value(handle.x==='x1'&&handle.index>0&&commands[handle.index-1].type!=='Z'?commands[handle.index-1]:command,'x')} y1={value(handle.x==='x1'&&handle.index>0&&commands[handle.index-1].type!=='Z'?commands[handle.index-1]:command,'y')} x2={x} y2={y} stroke="var(--ink-30)" strokeWidth={1}/>}
              <circle cx={x} cy={y} r={radius} fill={handle.x==='x'?'var(--bg)':'var(--ink)'} stroke="var(--ink)" strokeWidth={2} className="ge-handle" role="button" tabIndex={selected?.index===handle.index&&selected.x===handle.x?0:-1} aria-label={handle.name} aria-pressed={selected?.index===handle.index&&selected.x===handle.x} onFocus={()=>setSelected(handle)} onPointerDown={event=>{event.preventDefault();remember();svg.current?.focus();setSelected(handle);drag.current={handle,pointer:event.pointerId};event.currentTarget.setPointerCapture(event.pointerId)}}/>
            </g>})}
          </svg></div>}
          <p className="tw-status" role="status">{message||(selected?`${selected.name} selected.`:edited?'Edited outline. Undo or reset is available.':'Original outline. Select a point to reshape it.')}</p>
          {font?.charToGlyph(char).index===0&&<p className="ge-hint">This character is not included in the supplied font.</p>}
        </div>
        <aside className="tw-inspector" aria-label="Point inspector">{inspector('desktop')}</aside>
      </div>
      {workshop&&<div className="tw-specimen"><label htmlFor={`${id}-text`}>Your specimen</label><input id={`${id}-text`} value={text} maxLength={120} onChange={event=>{setText(event.target.value.replace(/[\r\n]/g,' '));setMessage('')}}/><label htmlFor={`${id}-size`}>Size · {size}px</label><PortfolioSlider id={`${id}-size`} min={24} max={160} value={size} onChange={event=>setSize(Number(event.target.value))}/><p>Switch to Specimen to see every retained edit in your text. Export embeds real vector outlines.</p></div>}
      {sheet&&<CompactSheet title="Point inspector" id={`${id}-inspector`} returnFocus={sheetButton.current} onClose={()=>setSheet(false)}><div className="tw-inspector-preview">{!loading&&font?<svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="img" aria-label={`Live ${char} outline`}><path d={d} fill="var(--ink-08)" stroke="var(--ink)" strokeWidth={2}/>{selected&&commands[selected.index]&&<circle cx={value(commands[selected.index],selected.x)} cy={value(commands[selected.index],selected.y)} r={radius} fill="var(--ink)"/>}</svg>:<p role="status">Preparing the outline…</p>}</div>{inspector('sheet')}</CompactSheet>}
    </div>
  </section>
}
