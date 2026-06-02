import { getAnonymousId } from './user'
import { setSupabaseToken } from './_supabase-token'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const TOKEN_KEY = '__whacka_auth_token'
const USER_KEY = '__whacka_auth_user'

const VIEWS = { LOGIN: 'login', SIGNUP: 'signup', FORGOT: 'forgot' }

function resolveAppPrimary() {
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim()
    if (!raw) return null
    const parts = raw.split(/\s+/).map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return null
    const [r, g, b] = parts
    const hex = v => v.toString(16).padStart(2, '0')
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)))
    return {
      primary: `#${hex(r)}${hex(g)}${hex(b)}`,
      hover: `#${hex(clamp(r * 0.8))}${hex(clamp(g * 0.8))}${hex(clamp(b * 0.8))}`,
      light: `#${hex(clamp(r + (255 - r) * 0.88))}${hex(clamp(g + (255 - g) * 0.88))}${hex(clamp(b + (255 - b) * 0.88))}`,
    }
  } catch { return null }
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

  :host {
    --wk-primary: #334155;
    --wk-primary-hover: #1e293b;
    --wk-primary-light: #f1f5f9;
    --wk-danger: #ef4444;
    --wk-text: #1e293b;
    --wk-text-muted: #64748b;
    --wk-border: #e2e8f0;
    --wk-bg: #ffffff;
    --wk-overlay: rgba(0, 0, 0, 0.5);
    --wk-radius-card: 12px;
    --wk-radius: 8px;
    --wk-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;

    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--wk-font);
    color: var(--wk-text);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .overlay {
    position: absolute;
    inset: 0;
    background: var(--wk-overlay);
    animation: wk-fade-in 0.2s ease;
  }

  @keyframes wk-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes wk-slide-up {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 16px;
    background: var(--wk-bg);
    border-radius: var(--wk-radius-card);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: wk-slide-up 0.25s ease;
    overflow: hidden;
  }

  .card-body {
    padding: 32px 28px 20px;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wk-text-muted);
    font-size: 20px;
    transition: background 0.15s, color 0.15s;
  }

  .close-btn:hover {
    background: #f1f5f9;
    color: var(--wk-text);
  }

  .logo {
    text-align: center;
    margin-bottom: 4px;
  }

  .title {
    text-align: center;
    font-size: 15px;
    color: var(--wk-text-muted);
    margin-bottom: 24px;
  }

  .view { display: none; }
  .view.active { display: block; }

  .view-transition {
    animation: wk-fade-in 0.15s ease;
  }

  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 5px;
    color: var(--wk-text);
  }

  input {
    display: block;
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    font-family: var(--wk-font);
    border: 1.5px solid var(--wk-border);
    border-radius: var(--wk-radius);
    outline: none;
    color: var(--wk-text);
    background: var(--wk-bg);
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 14px;
  }

  input::placeholder { color: #94a3b8; }

  input:focus {
    border-color: var(--wk-primary);
    box-shadow: 0 0 0 3px var(--wk-primary-light);
  }

  .btn {
    display: block;
    width: 100%;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--wk-font);
    border: none;
    border-radius: var(--wk-radius);
    cursor: pointer;
    background: var(--wk-primary);
    color: #fff;
    transition: background 0.15s, opacity 0.15s;
    margin-top: 4px;
    position: relative;
  }

  .btn:hover:not(:disabled) { background: var(--wk-primary-hover); }

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: wk-spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }

  @keyframes wk-spin {
    to { transform: rotate(360deg); }
  }

  .error-msg {
    background: #fef2f2;
    color: var(--wk-danger);
    font-size: 13px;
    padding: 8px 12px;
    border-radius: var(--wk-radius);
    margin-bottom: 14px;
    display: none;
  }

  .error-msg.visible { display: block; }

  .success-msg {
    background: #f0fdf4;
    color: #16a34a;
    font-size: 13px;
    padding: 8px 12px;
    border-radius: var(--wk-radius);
    margin-bottom: 14px;
    display: none;
  }

  .success-msg.visible { display: block; }

  .links {
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: var(--wk-text-muted);
  }

  .links a {
    color: var(--wk-primary);
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;
  }

  .links a:hover { text-decoration: underline; }

  .forgot-link {
    display: block;
    text-align: right;
    font-size: 12px;
    margin-top: -8px;
    margin-bottom: 14px;
  }

  .forgot-link a {
    color: var(--wk-primary);
    text-decoration: none;
    cursor: pointer;
  }

  .forgot-link a:hover { text-decoration: underline; }

  .footer {
    text-align: center;
    padding: 12px 28px;
    border-top: 1px solid var(--wk-border);
    font-size: 11px;
    color: #94a3b8;
  }

  .footer span { color: var(--wk-primary); font-weight: 600; }

  @media (max-width: 480px) {
    .card {
      max-width: 340px;
      margin: 16px auto;
      border-radius: 14px;
    }
    .card-body { padding: 22px 20px 14px; }
    .close-btn { top: 8px; right: 8px; width: 28px; height: 28px; font-size: 16px; }
    .logo { margin-bottom: 2px; }
    .logo svg { width: 88px; height: 26px; }
    .title { font-size: 13px; margin-bottom: 16px; }
    label { font-size: 12px; margin-bottom: 4px; }
    input { padding: 8px 10px; font-size: 13px; margin-bottom: 10px; }
    .btn { padding: 9px 14px; font-size: 13px; }
    .error-msg, .success-msg { font-size: 12px; padding: 6px 10px; margin-bottom: 10px; }
    .links { margin-top: 12px; font-size: 12px; }
    .forgot-link { font-size: 11px; margin-top: -6px; margin-bottom: 10px; }
    .footer { padding: 10px 16px; font-size: 10px; }
  }

  .credits-banner {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #92400e;
    line-height: 1.5;
  }

  /* Google sign-in: brand-neutral white button (NOT app-themed) so it stays
     recognizable as the official Google button under any app primary color. */
  .wk-google-wrap { position: relative; margin-bottom: 20px; }

  .wk-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--wk-font);
    color: #3c4043;
    background: #fff;
    border: 1.5px solid var(--wk-border);
    border-radius: var(--wk-radius);
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s, border-color 0.15s;
  }

  .wk-google:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .wk-google svg { width: 18px; height: 18px; flex: none; }

  /* Small tooltip below the Google button — preview-only hint, doesn't shift layout */
  .wk-tip {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    margin-top: 8px;
    background: #1e293b;
    color: #fff;
    font-size: 12px;
    line-height: 1.4;
    padding: 8px 11px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
    z-index: 10;
  }

  .wk-tip.show { opacity: 1; transform: translateY(0); }

  .wk-tip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: #1e293b;
  }
`

const GOOGLE_SVG = `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>`

const googleButton = () => `<div class="wk-google-wrap">
      <button class="wk-google" type="button" data-google>${GOOGLE_SVG}<span>Continue with Google</span></button>
      <div class="wk-tip" data-tip></div>
    </div>`

function buildView(view) {
  if (view === VIEWS.LOGIN) {
    return `
      ${googleButton()}
      <div class="error-msg" data-error></div>
      <label for="wk-login-email">Email</label>
      <input id="wk-login-email" type="email" placeholder="you@example.com" autocomplete="email" />
      <label for="wk-login-password">Password</label>
      <input id="wk-login-password" type="password" placeholder="Your password" autocomplete="current-password" />
      <div class="forgot-link"><a data-goto="forgot">Forgot password?</a></div>
      <button class="btn" data-submit>Log in</button>
      <div class="links">Don't have an account? <a data-goto="signup">Sign up</a></div>
    `
  }
  if (view === VIEWS.SIGNUP) {
    return `
      ${googleButton()}
      <div class="error-msg" data-error></div>
      <label for="wk-signup-email">Email</label>
      <input id="wk-signup-email" type="email" placeholder="you@example.com" autocomplete="email" />
      <label for="wk-signup-password">Password</label>
      <input id="wk-signup-password" type="password" placeholder="Min. 6 characters" autocomplete="new-password" />
      <label for="wk-signup-name">Display name <span style="font-weight:400;color:#94a3b8">(optional)</span></label>
      <input id="wk-signup-name" type="text" placeholder="How others see you" autocomplete="name" />
      <button class="btn" data-submit>Create account</button>
      <div class="links">Already have an account? <a data-goto="login">Log in</a></div>
    `
  }
  // FORGOT
  return `
    <div class="error-msg" data-error></div>
    <div class="success-msg" data-success></div>
    <label for="wk-forgot-email">Email</label>
    <input id="wk-forgot-email" type="email" placeholder="you@example.com" autocomplete="email" />
    <button class="btn" data-submit>Send reset link</button>
    <div class="links"><a data-goto="login">Back to login</a></div>
  `
}

function titleForView(view) {
  if (view === VIEWS.LOGIN)  return 'Sign in to your account'
  if (view === VIEWS.SIGNUP) return 'Create your Whacka ID'
  return 'Reset your password'
}

/**
 * Opens a Whacka-branded login/signup/forgot-password modal.
 * Resolves with `{ token, user }` on success, or `null` if dismissed.
 */
export function showAuthModal({ reason } = {}) {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    const shadow = host.attachShadow({ mode: 'closed' })
    let resolved = false

    function finish(result) {
      if (resolved) return
      resolved = true
      host.remove()
      resolve(result)
    }

    // --- Resolve app theme and build DOM ---
    const appColor = resolveAppPrimary()

    const style = document.createElement('style')
    style.textContent = STYLES
    shadow.appendChild(style)

    if (appColor) {
      host.style.setProperty('--wk-primary', appColor.primary)
      host.style.setProperty('--wk-primary-hover', appColor.hover)
      host.style.setProperty('--wk-primary-light', appColor.light)
    }

    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    overlay.addEventListener('click', () => finish(null))
    shadow.appendChild(overlay)

    const card = document.createElement('div')
    card.className = 'card'
    card.addEventListener('click', (e) => e.stopPropagation())
    shadow.appendChild(card)

    const closeBtn = document.createElement('button')
    closeBtn.className = 'close-btn'
    closeBtn.innerHTML = '&#x2715;'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.addEventListener('click', () => finish(null))
    card.appendChild(closeBtn)

    const body = document.createElement('div')
    body.className = 'card-body'
    card.appendChild(body)

    const logo = document.createElement('div')
    logo.className = 'logo'
    logo.innerHTML = `<svg width="120" height="36" viewBox="0 0 200 55" style="overflow:visible">
      <text x="100" y="42" text-anchor="middle" font-family="'Pacifico', cursive" font-size="42" font-weight="400" letter-spacing="1" fill="none" stroke="${appColor?.primary || '#C95A3C'}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">Whacka</text>
      <text x="100" y="42" text-anchor="middle" font-family="'Pacifico', cursive" font-size="42" font-weight="400" letter-spacing="1" fill="${appColor?.primary || '#C95A3C'}">Whacka</text>
    </svg>`
    body.appendChild(logo)

    const titleEl = document.createElement('div')
    titleEl.className = 'title'
    body.appendChild(titleEl)

    if (reason === 'credits') {
      const banner = document.createElement('div')
      banner.className = 'credits-banner'
      banner.textContent = '\u26A1 Sign up free for 8 credits/day \u2014 2\u00D7 more!'
      body.appendChild(banner)
    }

    const viewContainer = document.createElement('div')
    body.appendChild(viewContainer)

    const footer = document.createElement('div')
    footer.className = 'footer'
    footer.innerHTML = 'Powered by <span>Whacka</span>'
    card.appendChild(footer)

    // --- View management ---
    let currentView = null

    function switchTo(view) {
      currentView = view
      titleEl.textContent = titleForView(view)
      viewContainer.innerHTML = `<div class="view active view-transition">${buildView(view)}</div>`
      wireView(view)
      const firstInput = viewContainer.querySelector('input')
      if (firstInput) setTimeout(() => firstInput.focus(), 60)
    }

    function wireView(view) {
      const root = viewContainer

      root.querySelectorAll('[data-goto]').forEach((a) => {
        a.addEventListener('click', (e) => {
          e.preventDefault()
          switchTo(a.dataset.goto)
        })
      })

      // Google sign-in: top-level navigate to whacka.app to run the OAuth flow
      // (a static *.whacka.app PWA can't run PKCE on its own origin). The flow
      // returns to this app with a one-time #wk_code that main.jsx exchanges.
      const googleBtn = root.querySelector('[data-google]')
      if (googleBtn) {
        const tip = root.querySelector('[data-tip]')
        let tipTimer
        googleBtn.addEventListener('click', () => {
          // Google refuses OAuth inside iframes / embedded webviews (it 403s). The
          // editor preview runs the app in an iframe (window.self !== window.top),
          // so Google sign-in is only available on the published standalone app.
          // Surface that as a small tooltip near the button — not a full-width error.
          if (window.self !== window.top) {
            if (tip) {
              tip.textContent = 'Google sign-in only works on your published app, not the preview.'
              tip.classList.add('show')
              clearTimeout(tipTimer)
              tipTimer = setTimeout(() => tip.classList.remove('show'), 4000)
            }
            return
          }
          const anon = getAnonymousId() || ''
          const url = `${API_BASE}/api/auth/app-google/start`
            + `?origin=${encodeURIComponent(location.origin)}`
            + `&anon=${encodeURIComponent(anon)}`
          window.location.href = url
        })
      }

      const submitBtn = root.querySelector('[data-submit]')
      const errorEl = root.querySelector('[data-error]')
      const successEl = root.querySelector('[data-success]')
      const inputs = root.querySelectorAll('input')

      function showError(msg) {
        errorEl.textContent = msg
        errorEl.classList.add('visible')
      }

      function clearMessages() {
        errorEl.textContent = ''
        errorEl.classList.remove('visible')
        if (successEl) {
          successEl.textContent = ''
          successEl.classList.remove('visible')
        }
      }

      function setLoading(on) {
        submitBtn.disabled = on
        if (on) {
          submitBtn.dataset.label = submitBtn.textContent
          submitBtn.innerHTML = '<span class="spinner"></span>Please wait…'
        } else {
          submitBtn.textContent = submitBtn.dataset.label || ''
        }
      }

      // Submit on Enter key
      inputs.forEach((input) => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submitBtn.click()
          }
        })
      })

      submitBtn.addEventListener('click', async () => {
        clearMessages()

        if (view === VIEWS.LOGIN) {
          const email = root.querySelector('#wk-login-email').value.trim()
          const password = root.querySelector('#wk-login-password').value
          if (!email || !password) return showError('Please fill in all fields.')

          setLoading(true)
          try {
            const res = await fetch(`${API_BASE}/api/auth/signin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, anonymousId: getAnonymousId() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Invalid credentials')
            saveAndFinish(data)
          } catch (err) {
            setLoading(false)
            showError(err.message)
          }
        }

        if (view === VIEWS.SIGNUP) {
          const email = root.querySelector('#wk-signup-email').value.trim()
          const password = root.querySelector('#wk-signup-password').value
          const displayName = root.querySelector('#wk-signup-name').value.trim() || undefined
          if (!email || !password) return showError('Email and password are required.')
          if (password.length < 6) return showError('Password must be at least 6 characters.')

          setLoading(true)
          try {
            const res = await fetch(`${API_BASE}/api/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, displayName, anonymousId: getAnonymousId() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not create account')
            saveAndFinish(data)
          } catch (err) {
            setLoading(false)
            showError(err.message)
          }
        }

        if (view === VIEWS.FORGOT) {
          const email = root.querySelector('#wk-forgot-email').value.trim()
          if (!email) return showError('Please enter your email.')

          setLoading(true)
          try {
            const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Something went wrong')
            setLoading(false)
            successEl.textContent = 'Check your email for a reset link.'
            successEl.classList.add('visible')
          } catch (err) {
            setLoading(false)
            showError(err.message)
          }
        }
      })
    }

    function saveAndFinish({ token, supabaseToken, user, migration }) {
      try {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        if (migration && !migration.migrated) {
          const anonId = getAnonymousId()
          if (anonId) localStorage.setItem('__whacka_migration_pending', anonId)
        } else {
          localStorage.removeItem('__whacka_migration_pending')
        }
      } catch {}
      // Persist supabaseToken so Realtime / RLS see the right auth.uid().
      // Null is fine — falls back to the guest-token endpoint.
      if (supabaseToken) setSupabaseToken(supabaseToken)
      finish({ token, user })
    }

    // --- Escape key ---
    function onKey(e) {
      if (e.key === 'Escape') finish(null)
    }
    document.addEventListener('keydown', onKey)
    const origRemove = host.remove.bind(host)
    host.remove = () => {
      document.removeEventListener('keydown', onKey)
      origRemove()
    }

    // --- Mount & show ---
    document.body.appendChild(host)
    switchTo(reason === 'credits' ? VIEWS.SIGNUP : VIEWS.LOGIN)
  })
}
