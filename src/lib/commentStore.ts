export type PortfolioComment = {
  id: string
  route: string
  xPercent: number
  yPercent: number
  selector: string | null
  authorName: string
  authorEmail: string | null
  body: string
  status: 'open' | 'pending' | 'hidden'
  createdAt: string
}

export type NewPortfolioComment = Omit<PortfolioComment, 'id' | 'status' | 'createdAt'>

type SupabaseCommentRow = {
  id: string
  route: string
  x_percent: number
  y_percent: number
  selector: string | null
  author_name: string
  author_email: string | null
  body: string
  status: 'open' | 'pending' | 'hidden'
  created_at: string
}

const localStorageKey = 'portfolio-comments-v1'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublicKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
) as string | undefined
const commentsTable = (import.meta.env.VITE_COMMENTS_TABLE as string | undefined) || 'portfolio_comments'

function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublicKey)
}

function supabaseEndpoint(query = '') {
  if (!supabaseUrl) throw new Error('Missing Supabase URL')
  const baseUrl = supabaseUrl.replace(/\/$/, '')
  return `${baseUrl}/rest/v1/${commentsTable}${query}`
}

function supabaseHeaders(extra?: HeadersInit): HeadersInit {
  if (!supabasePublicKey) throw new Error('Missing Supabase publishable key')
  return {
    apikey: supabasePublicKey,
    'Content-Type': 'application/json',
    ...extra,
  }
}

function toComment(row: SupabaseCommentRow): PortfolioComment {
  return {
    id: row.id,
    route: row.route,
    xPercent: row.x_percent,
    yPercent: row.y_percent,
    selector: row.selector,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  }
}

function toRow(comment: NewPortfolioComment) {
  return {
    route: comment.route,
    x_percent: comment.xPercent,
    y_percent: comment.yPercent,
    selector: comment.selector,
    author_name: comment.authorName,
    author_email: comment.authorEmail,
    body: comment.body,
    // New comments await manual approval; RLS rejects any other status.
    status: 'pending' as const,
  }
}

function readLocalComments(): PortfolioComment[] {
  try {
    const stored = window.localStorage.getItem(localStorageKey)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalComments(comments: PortfolioComment[]) {
  try {
    window.localStorage.setItem(localStorageKey, JSON.stringify(comments))
  } catch {
    // Comments still render for the current session when storage is unavailable.
  }
}

export function normalizeCommentRoute(pathname: string) {
  const withoutBase = pathname.replace(/^\/Portfolio\.github\.io/, '') || '/'
  return withoutBase === '' ? '/' : withoutBase
}

export function getCommentStoreMode() {
  return hasSupabaseConfig() ? 'database' : 'local'
}

export async function listPortfolioComments(route: string): Promise<PortfolioComment[]> {
  if (!hasSupabaseConfig()) {
    return readLocalComments()
      .filter(comment => comment.route === route && comment.status !== 'hidden')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  const query = `?route=eq.${encodeURIComponent(route)}&status=eq.open&order=created_at.asc`
  const response = await fetch(supabaseEndpoint(query), {
    headers: supabaseHeaders(),
  })

  if (!response.ok) {
    throw new Error('Could not load comments')
  }

  const rows = await response.json() as SupabaseCommentRow[]
  return rows.map(toComment)
}

export async function createPortfolioComment(comment: NewPortfolioComment): Promise<PortfolioComment> {
  if (!hasSupabaseConfig()) {
    const saved: PortfolioComment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    writeLocalComments([...readLocalComments(), saved])
    return saved
  }

  // return=minimal: the read policy only exposes approved rows, so the API
  // cannot echo back the pending insert. Build the local representation here.
  const response = await fetch(supabaseEndpoint(), {
    method: 'POST',
    headers: supabaseHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(toRow(comment)),
  })

  if (!response.ok) {
    throw new Error('Could not save comment')
  }

  return {
    ...comment,
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}
