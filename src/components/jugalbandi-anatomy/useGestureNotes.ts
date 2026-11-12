import {useEffect,useRef} from 'react'
/** Rate-limit moving input without dropping its final note. No timer survives cancellation. */
export function useGestureNotes(onNote:(index:number)=>void,paused=false,cancelVersion=0){
 const latest=useRef({onNote,paused});latest.current={onNote,paused}
 const state=useRef({note:-1,at:0,pending:null as number|null,timer:0})
 const cancel=()=>{clearTimeout(state.current.timer);state.current.timer=0;state.current.pending=null}
 const emit=(force=false)=>{
  const s=state.current,index=s.pending;cancel()
  if(index===null||document.hidden||(!force&&latest.current.paused))return
  if(force||index!==s.note){s.note=index;s.at=performance.now();latest.current.onNote(index)}
 }
 const send=(index:number,force=false)=>{
  const s=state.current;s.pending=index
  if(force||performance.now()-s.at>=65){emit(force);return}
  if(!s.timer)s.timer=window.setTimeout(()=>emit(),Math.max(0,65-(performance.now()-s.at)))
 }
 const finish=(flush:boolean)=>{if(flush&&state.current.pending!==null&&state.current.pending!==state.current.note)emit();else cancel();state.current.note=-1}
 useEffect(()=>cancel(),[cancelVersion])
 useEffect(()=>{const hidden=()=>{if(document.hidden)cancel()};window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',hidden);return()=>{cancel();window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',hidden)}},[])
 return {send,finish,cancel}
}
