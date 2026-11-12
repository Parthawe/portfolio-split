import type { HexaVoice } from './model'
export const responders = {flute:{kind:'flute',name:'Robotic flute'},tanpura:{kind:'harp',name:'Mechanized harp'},tabla:{kind:'rain',name:'Rainsticks'}} as const
export const tunes = [
  {id:'rising',name:'Rising phrase',notes:'C4 D4 E4 G4 E4 D4 C4'},
  {id:'answer',name:'Question and answer',notes:'C4 E4 G4 E4 D4 F4 E4 C4'},
  {id:'rhythm',name:'Rhythm study',notes:'C4 C4 G4 C4 G4 G4 C4'},
] as const
export function noteName(note:number){return `${['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][note%12]}${Math.floor(note/12)-1}`}
export function parseTune(text:string):number[]{
 const tokens=text.trim().split(/[\s,]+/).filter(Boolean)
 if(!tokens.length||tokens.length>32)throw Error('Enter between 1 and 32 notes, for example C4 D4 E4 G4.')
 return tokens.map(token=>{
  const match=/^([A-G])([#b]?)([0-8])$/i.exec(token)
  const note=match?12*(Number(match[3])+1)+({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1].toUpperCase()]!)+(match[2]==='#'?1:match[2].toLowerCase()==='b'?-1:0):/^\d+$/.test(token)?Number(token):-1
  if(note<48||note>84)throw Error(`“${token}” is outside this demo’s C3–C6 range. Use notes such as C4, F#4 or MIDI numbers 48–84.`)
  return note
 })
}
export type DuetEvent={at:number;side:'call'|'answer';note:number;index:number;voice:HexaVoice;velocity:number}
export function duetSequence(notes:number[],voice:HexaVoice,bpm:number,style:'trade'|'phrase',velocity=96):DuetEvent[]{
 const beat=60/Math.max(40,Math.min(160,bpm))
 return notes.flatMap((note,index)=>[{at:(style==='trade'?index*2:index)*beat,side:'call' as const,note,index,voice,velocity},{at:(style==='trade'?index*2+1:notes.length+1+index)*beat,side:'answer' as const,note,index,voice,velocity}]).sort((a,b)=>a.at-b.at)
}
