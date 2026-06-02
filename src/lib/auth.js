/**
 * Auth helper — Whacka ID authentication for generated apps.
 * One account across all Whacka apps. auth.signIn() opens a
 * platform-provided modal that handles sign-up, sign-in, and
 * password recovery.
 */

import { showAuthModal } from './auth-modal'
import { clearSupabaseToken } from './_supabase-token'

const TOKEN_KEY = '__whacka_auth_token'
const USER_KEY = '__whacka_auth_user'

const listeners = new Set()
let currentUser = null

function getStoredToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function notifyListeners(user) {
  for (const fn of listeners) {
    try { fn(user) } catch (err) { console.error('[auth] Listener error:', err) }
  }
}

currentUser = getStoredUser()

export const auth = {
  /**
   * Open the Whacka login modal. Handles sign-up, sign-in, and
   * password recovery in a single flow.
   *
   * @returns {Promise<{ id, email, displayName, avatarUrl } | null>}
   *   Resolves with user object on success, or null if dismissed.
   *
   * @example
   * const user = await auth.signIn()
   * if (user) console.log('Welcome', user.displayName)
   */
  async signIn(options = {}) {
    const result = await showAuthModal(options)
    if (!result) return null

    currentUser = result.user
    notifyListeners(currentUser)
    return currentUser
  },

  /**
   * Sign out the current user. Clears stored credentials.
   * After sign-out, data operations fall back to anonymous identity.
   */
  signOut() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {}
    clearSupabaseToken()
    currentUser = null
    notifyListeners(null)
  },

  /**
   * Get the currently signed-in user, or null.
   * Returns cached data — no network request.
   *
   * @returns {{ id, email, displayName, avatarUrl } | null}
   */
  getCurrentUser() {
    return currentUser
  },

  /**
   * Check if a user is currently signed in.
   * @returns {boolean}
   */
  isAuthenticated() {
    return currentUser !== null && getStoredToken() !== null
  },

  /**
   * Subscribe to auth state changes. Fires immediately with the
   * current state, then again on every sign-in or sign-out.
   *
   * @param {function} callback - Called with user object or null
   * @returns {function} unsubscribe
   *
   * @example
   * const unsub = auth.onAuthChange((user) => {
   *   if (user) console.log('Signed in:', user.email)
   *   else console.log('Signed out')
   * })
   */
  onAuthChange(callback) {
    listeners.add(callback)
    try { callback(currentUser) } catch (err) {
      console.error('[auth] onAuthChange initial callback error:', err)
    }
    return () => listeners.delete(callback)
  },

  /**
   * Is the signed-in user the BUILDER/owner of this app? True only for the person
   * who created the app in Whacka. The builder is automatically the highest-privilege
   * admin of the app's shared data + every group (server-enforced). Use this to gate
   * admin/manager-only UI — it is a UX hint, NOT a security boundary (the server
   * enforces the real privilege independently).
   *
   * @returns {boolean}
   * @example if (auth.isAppOwner()) showManagerControls()
   */
  isAppOwner() {
    const ownerId = import.meta.env.VITE_APP_OWNER_ID
    return !!ownerId && !!currentUser && currentUser.id === ownerId
  },

  /**
   * Get the current auth token (for custom API calls).
   * @returns {string | null}
   */
  getToken() {
    return getStoredToken()
  },
}
