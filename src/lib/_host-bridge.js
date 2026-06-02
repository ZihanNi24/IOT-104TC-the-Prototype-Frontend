function isTrustedHost(origin) {
  try {
    const host = new URL(origin).hostname
    return host.endsWith('whacka.app') || host.includes('localhost')
  } catch {
    return false
  }
}

function shouldUseHostBridge() {
  if (window.self === window.top) return false
  if (!document.referrer) return false
  return isTrustedHost(document.referrer)
}

function sendHostRequest(type, payload) {
  return new Promise((resolve, reject) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', onMessage)
      reject(new Error('Host bridge timed out'))
    }, 30000)

    function onMessage(event) {
      if (event.source !== window.parent) return
      if (!isTrustedHost(event.origin)) return
      if (event.data?.type !== 'whacka-host-response') return
      if (event.data.requestId !== requestId) return

      window.clearTimeout(timeout)
      window.removeEventListener('message', onMessage)

      if (event.data.ok) {
        resolve()
        return
      }

      const error = new Error(event.data.error || 'Host action failed')
      if (event.data.name) {
        error.name = event.data.name
      }
      reject(error)
    }

    window.addEventListener('message', onMessage)
    window.parent.postMessage({ type, requestId, ...payload }, '*')
  })
}

export function installHostBridge() {
  if (!shouldUseHostBridge()) return

  try {
    const nativeShare = typeof navigator.share === 'function'
      ? navigator.share.bind(navigator)
      : null

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data) => {
        if (nativeShare) {
          try {
            return await nativeShare(data)
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              throw error
            }
          }
        }

        return sendHostRequest('whacka-host-share', { data })
      },
    })
  } catch {}

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      const nativeWriteText = navigator.clipboard.writeText.bind(navigator.clipboard)

      navigator.clipboard.writeText = async (text) => {
        try {
          return await nativeWriteText(text)
        } catch {
          return sendHostRequest('whacka-host-copy', { text })
        }
      }
    }
  } catch {}
}
