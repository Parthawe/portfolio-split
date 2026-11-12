import { isCompletePanelAnswer } from './panelAnswerQuality'
export interface EdgeAIRequest {
  message: string
  route: string
  localAnswer: string
  context: unknown
  model: string
  surface?: 'cursor' | 'panel'
}

interface EdgeAIResponse {
  answer?: string
  text?: string
  model?: string
}

const EDGE_ENDPOINT = import.meta.env.VITE_EDGE_AI_ENDPOINT?.trim()
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '')
const EDGE_ENABLED =
  import.meta.env.VITE_EDGE_AI_ENABLED === '1' ||
  import.meta.env.VITE_EDGE_AI_ENABLED === 'true' ||
  Boolean(EDGE_ENDPOINT)

const DEFAULT_ENDPOINT = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/folio-answer`
  : '/api/folio-answer'
const EDGE_MODEL = import.meta.env.VITE_EDGE_AI_MODEL?.trim() || 'gemini-3.1-flash-lite'

export function isEdgeAIEnabled() {
  return EDGE_ENABLED
}

export function getEdgeAIModel() {
  return EDGE_MODEL
}

export async function getEdgeAIAnswer(payload: EdgeAIRequest, timeoutMs = payload.surface === 'panel' ? 26_000 : 6_500, onSource?: (source: 'ai' | 'notes') => void): Promise<string | null> {
  if (!EDGE_ENABLED || typeof fetch !== 'function') return null

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const original = payload.context && typeof payload.context === 'object' && !Array.isArray(payload.context) ? payload.context : {}
      const body = attempt === 0 ? payload : { ...payload, context: { ...original, responseRequirements: 'The previous reply did not finish. Answer the original question in 40–80 words. Use supplied project evidence when relevant and end every sentence completely. Do not continue the unfinished reply.' } }
      const response = await fetch(EDGE_ENDPOINT || DEFAULT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!response.ok) return null
      const data = await response.json() as EdgeAIResponse
      const answer = typeof data.answer === 'string' ? data.answer : data.text
      if (typeof answer !== 'string' || !answer.trim()) return null
      if (payload.surface === 'panel' && data.model !== 'portfolio-knowledge' && !isCompletePanelAnswer(answer)) {
        if (attempt === 0) continue
        return null
      }
      onSource?.(data.model === 'portfolio-knowledge' ? 'notes' : 'ai')
      return answer.trim().slice(0, 2200)
    }
    return null
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}
