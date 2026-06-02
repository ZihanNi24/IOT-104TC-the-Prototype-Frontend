import { auth } from './auth'
import { showCreditsGate } from './credits-gate'

/**
 * Shared 429 handler for all runtime API calls.
 * Shows a contextual modal based on user tier, then always throws.
 */
export async function handleRateLimit(res) {
  const d = await res.json().catch(() => ({}))

  if (d.tier === 'anonymous' && !auth.isAuthenticated()) {
    await auth.signIn({ reason: 'credits' })
  } else if (d.tier !== 'anonymous') {
    await showCreditsGate(d.tier, d.exhaustion)
  }

  throw new Error(d.error || 'Credits exhausted')
}
