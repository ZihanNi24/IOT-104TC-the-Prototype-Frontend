/**
 * Platform identity bridge — receives a short-lived JWT from the parent
 * frame (whacka.app Explore) via postMessage. This token is used by
 * _headers.js as the Authorization header so the server can resolve the
 * platform user's real identity instead of falling back to anonymous.
 *
 * The listener is set up at module load time (side-effect) so it's ready
 * before any API calls are made.
 */

let platformToken = null

window.addEventListener('message', (event) => {
  try {
    const host = new URL(event.origin).hostname
    if (!host.endsWith('whacka.app') && !host.includes('localhost')) return
  } catch { return }
  if (event.data?.type === 'whacka-platform-auth' && event.data.token) {
    platformToken = event.data.token
  }
})

export function getPlatformToken() {
  return platformToken
}
