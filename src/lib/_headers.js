/**
 * Shared HTTP headers for all preview-template API calls.
 * Ensures consistent auth credentials across db, ai, audio, storage, etc.
 */

import { getAppUserId } from './user'
import { getPlatformToken } from './_platform-auth'

const TOKEN_KEY = '__whacka_auth_token'

/**
 * Auth headers without Content-Type — use for FormData requests
 * where the browser must set Content-Type with the boundary.
 *
 * @param {Record<string, string>} [extra] - Additional headers to merge
 * @returns {Record<string, string>}
 */
export function getAuthHeaders(extra = {}) {
  const headers = { ...extra }

  try {
    const userId = getAppUserId()
    if (userId) headers['X-Whacka-UID'] = userId
  } catch {}

  const pt = getPlatformToken()
  if (pt) {
    headers['Authorization'] = `Bearer ${pt}`
  } else {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) headers['Authorization'] = `Bearer ${token}`
    } catch {}
  }

  const previewToken = import.meta.env.VITE_PREVIEW_TOKEN
  if (previewToken) {
    headers['X-Whacka-Preview'] = previewToken
  }

  return headers
}

/**
 * Auth headers with Content-Type: application/json — use for JSON requests.
 *
 * @returns {Record<string, string>}
 */
export function getHeaders() {
  return getAuthHeaders({ 'Content-Type': 'application/json' })
}
