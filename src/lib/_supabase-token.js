/**
 * Supabase JWT manager — fetches and caches a token for Realtime / RLS auth.
 *
 * Two paths:
 *   - Authenticated user → token saved at signin/signup time (auth-modal.js)
 *   - Anonymous user → POST /api/auth/guest-token with X-Whacka-UID header
 *
 * Refreshes when the cached token is expiring within 24h or absent.
 * Returns null (gracefully) if server doesn't support it (SUPABASE_LEGACY_JWT_SECRET unset).
 *
 * Internal: not exposed to generated app code. Used by db.js / messaging.js / realtime.js.
 */

import { getAppUserId } from './user'

const STORAGE_KEY = '__whacka_supabase_token'
const REFRESH_BEFORE_SECONDS = 24 * 60 * 60 // refresh if exp < 1 day away

const API_BASE = import.meta.env.VITE_API_BASE || ''

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

function writeStored(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function decodeExp(jwtStr) {
  try {
    const payload = jwtStr.split('.')[1]
    if (!payload) return 0
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json)
    return typeof exp === 'number' ? exp : 0
  } catch { return 0 }
}

function isExpiringSoon(jwtStr) {
  const exp = decodeExp(jwtStr)
  if (!exp) return true
  return (exp - Math.floor(Date.now() / 1000)) < REFRESH_BEFORE_SECONDS
}

let _inflight = null

async function fetchGuestToken() {
  let uid
  try { uid = getAppUserId() } catch { return null }
  if (!uid) return null
  try {
    const res = await fetch(`${API_BASE}/api/auth/guest-token`, {
      method: 'POST',
      headers: { 'X-Whacka-UID': uid, 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    const { supabaseToken } = await res.json()
    return supabaseToken || null
  } catch { return null }
}

/**
 * Get a usable Supabase JWT. Returns null if not available (e.g. offline,
 * server doesn't support it). Callers should fall back to anon-key context.
 */
export async function getSupabaseToken() {
  if (_inflight) return _inflight

  const cached = readStored()
  if (cached && !isExpiringSoon(cached)) return cached

  _inflight = (async () => {
    try {
      const token = await fetchGuestToken()
      if (token) writeStored(token)
      return token
    } finally {
      _inflight = null
    }
  })()

  return _inflight
}

/**
 * Called by auth-modal.js on successful signin/signup to persist the token
 * returned by the server (avoids a round-trip through guest-token).
 */
export function setSupabaseToken(token) {
  writeStored(token)
}

/**
 * Called by auth.signOut() to discard the user's token. Next call will
 * fall back to the guest-token path under the new anonymous UID.
 */
export function clearSupabaseToken() {
  writeStored(null)
}
