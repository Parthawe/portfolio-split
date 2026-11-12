import { midiForSensor, demoFrequency, type HexaVoice, type Instrument } from './model'
/** Illustrative synthesis. Never presented as a recording or recovered tuning. */
export class MechanismAudio {
  context: AudioContext | null = null
  private voices = new Set<AudioScheduledSourceNode>()
  async enable() { this.context ??= new AudioContext(); await this.context.resume() }
  play(kind: Instrument, channel: number, velocity=96, hexaVoice:HexaVoice='flute', note?:number, delay=0, allowInactive=false) {
    const ctx = this.context
    if (!ctx || (ctx.state !== 'running' && !(allowInactive && ctx.state !== 'closed'))) return
    this.stop()
    const at=ctx.currentTime+Math.max(0,delay)
    const duration = kind === 'harp' ? 1.1 : kind==='hexa'?(hexaVoice==='tanpura'?1.8:hexaVoice==='tabla'?.35:.6):.8, gain = ctx.createGain(), filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'; filter.frequency.value = kind === 'rain' ? 2500 : 4500
    gain.gain.setValueAtTime(.0001, at)
    gain.gain.exponentialRampToValueAtTime(.12*(kind==='hexa'||note!==undefined?midiForSensor(channel,velocity).velocity/127:1), at + .015)
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration)
    gain.connect(filter); filter.connect(ctx.destination)
    let source: AudioScheduledSourceNode
    if (kind === 'flute'||(kind==='hexa'&&hexaVoice!=='tanpura')) {
      const oscillator = ctx.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = note!==undefined?440*2**((note-69)/12):kind==='hexa'?440*2**((midiForSensor(channel).note-69)/12):demoFrequency(channel + 2); if(kind==='hexa'&&hexaVoice==='tabla'){oscillator.frequency.setValueAtTime(180+channel*4,at);oscillator.frequency.exponentialRampToValueAtTime(70+channel*2,at+.12)}oscillator.connect(gain); source = oscillator
    } else {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate), samples = buffer.getChannelData(0), period = Math.round(ctx.sampleRate / (note!==undefined?440*2**((note-69)/12):kind==='hexa'?440*2**((midiForSensor(channel).note-69)/12):demoFrequency(channel)))
      for (let i = 0; i < samples.length; i++) samples[i] = (kind === 'harp'||kind==='hexa') ? (i < period ? Math.random() * 2 - 1 : .495 * (samples[i - period] + samples[Math.max(0, i - period - 1)])) : (Math.random() * 2 - 1) * (.2 + .8 * Math.sin(i / ctx.sampleRate * 55) ** 8)
      const player = ctx.createBufferSource(); player.buffer = buffer; player.connect(gain); source = player
    }
    source.onended = () => { source.disconnect(); gain.disconnect(); filter.disconnect(); this.voices.delete(source) }
    this.voices.add(source); source.start(at); source.stop(at + duration)
  }
  stop() { for (const source of this.voices) { try { source.stop() } catch { /* Already ended. */ } } this.voices.clear() }
  close() { this.stop(); void this.context?.close(); this.context = null }
}
