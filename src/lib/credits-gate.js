/**
 * Credits-gate modal — shown when a user exhausts their credits
 * in a published Whacka app. Content adapts to tier + exhaustion reason.
 */

const PLATFORM_URL = import.meta.env.VITE_API_BASE || 'https://whacka.app'

const PAID_TIERS = ['starter', 'pro', 'ultra']

const TIER_LABELS = { starter: 'Starter', pro: 'Pro', ultra: 'Ultra' }

const PLANS = [
  { id: 'starter', label: 'Starter', credits: '200/mo', price: '$9/mo' },
  { id: 'pro',     label: 'Pro',     credits: '800/mo', price: '$29/mo' },
  { id: 'ultra',   label: 'Ultra',   credits: '2,500/mo', price: '$79/mo' },
]

const NEXT_TIER = { free: 'starter', starter: 'pro', pro: 'ultra' }

const STYLES = `
  :host {
    --cg-accent: #6366f1;
    --cg-accent-hover: #4f46e5;
    --cg-text: #1e293b;
    --cg-text-muted: #64748b;
    --cg-border: #e2e8f0;
    --cg-bg: #ffffff;
    --cg-overlay: rgba(0, 0, 0, 0.5);
    --cg-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;

    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--cg-font);
    color: var(--cg-text);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .overlay {
    position: absolute;
    inset: 0;
    background: var(--cg-overlay);
    animation: cg-fade 0.2s ease;
  }

  @keyframes cg-fade { from { opacity: 0 } }

  @keyframes cg-slide {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
  }

  .card {
    position: relative;
    width: 100%;
    max-width: 380px;
    margin: 16px;
    background: var(--cg-bg);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: cg-slide 0.25s ease;
    overflow: hidden;
  }

  .body { padding: 32px 28px 24px; text-align: center; }

  .icon { font-size: 32px; margin-bottom: 8px; }

  .headline {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
  }

  .sub {
    font-size: 14px;
    color: var(--cg-text-muted);
    margin-bottom: 20px;
  }

  .plans {
    border: 1px solid var(--cg-border);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    text-align: left;
  }

  .plan-row {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    font-size: 13px;
  }

  .plan-row + .plan-row { border-top: 1px solid var(--cg-border); }

  .plan-name  { font-weight: 600; min-width: 55px; }
  .plan-credits { color: var(--cg-text-muted); flex: 1; text-align: center; }

  .plan-select {
    margin-left: 8px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--cg-font);
    color: var(--cg-accent);
    background: transparent;
    border: 1px solid var(--cg-border);
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.15s;
  }

  .plan-select:hover { border-color: var(--cg-accent); }

  .btn {
    display: block;
    width: 100%;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--cg-font);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: background 0.15s, border-color 0.15s;
    color: #fff;
    background: var(--cg-accent);
  }

  .btn:hover { background: var(--cg-accent-hover); }

  .btn-outline {
    background: transparent;
    color: var(--cg-accent);
    border: 1.5px solid var(--cg-border);
    margin-top: 8px;
  }

  .btn-outline:hover { background: transparent; border-color: var(--cg-accent); }

  .note {
    margin-top: 16px;
    font-size: 12px;
    color: var(--cg-text-muted);
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
    color: var(--cg-text-muted);
    font-size: 20px;
    transition: background 0.15s, color 0.15s;
  }

  .close-btn:hover { background: #f1f5f9; color: var(--cg-text); }

  .footer {
    text-align: center;
    padding: 12px 28px;
    border-top: 1px solid var(--cg-border);
    font-size: 11px;
    color: #94a3b8;
  }

  .footer span { color: var(--cg-accent); font-weight: 600; }

  @media (max-width: 480px) {
    .card { margin: 8px; }
    .body { padding: 20px 16px 18px; }
    .headline { font-size: 16px; }
    .sub { font-size: 13px; margin-bottom: 16px; }
    .plan-row { padding: 6px 12px; font-size: 12px; }
    .plan-select { padding: 3px 10px; font-size: 11px; }
    .btn { padding: 10px 14px; font-size: 13px; }
    .close-btn { top: 8px; right: 8px; width: 28px; height: 28px; font-size: 16px; }
    .footer { padding: 10px 16px; font-size: 10px; }
  }
`

function buildFreeDailyContent() {
  const rows = PLANS.map(p =>
    `<div class="plan-row">
      <span class="plan-name">${p.label}</span>
      <span class="plan-credits">${p.credits}</span>
      <a class="plan-select" href="${PLATFORM_URL}/?upgrade=${p.id}" target="_blank" rel="noopener">${p.price}</a>
    </div>`
  ).join('')

  return `
    <div class="icon">\u26A1</div>
    <div class="headline">Today\u2019s credits are used up</div>
    <div class="sub">Your 8 daily credits refresh at midnight UTC.<br>Get a plan for more credits every month.</div>
    <div class="plans">${rows}</div>
  `
}

function buildFreeMonthlyContent() {
  const rows = PLANS.map(p =>
    `<div class="plan-row">
      <span class="plan-name">${p.label}</span>
      <span class="plan-credits">${p.credits}</span>
      <a class="plan-select" href="${PLATFORM_URL}/?upgrade=${p.id}" target="_blank" rel="noopener">${p.price}</a>
    </div>`
  ).join('')

  return `
    <div class="icon">\u26A1</div>
    <div class="headline">Monthly free limit reached</div>
    <div class="sub">You\u2019ve used your 24 free credits this month.<br>Get a plan to unlock more.</div>
    <div class="plans">${rows}</div>
  `
}

function buildPaidContent(tier) {
  const label = TIER_LABELS[tier] || tier
  const next = NEXT_TIER[tier]
  let html = `
    <div class="icon">\u26A1</div>
    <div class="headline">Your ${label} credits are used up</div>
    <div class="sub">Top up or upgrade to keep going</div>
    <a class="btn" href="${PLATFORM_URL}/?topup=credits" target="_blank" rel="noopener">Top up 100 credits \u2014 $9</a>
  `
  if (next) {
    const plan = PLANS.find(p => p.id === next)
    html += `<a class="btn btn-outline" href="${PLATFORM_URL}/?upgrade=${next}" target="_blank" rel="noopener">Upgrade to ${plan.label} \u2014 ${plan.credits}</a>`
  }
  return html
}

let gateOpen = false

/**
 * Show a credits-exhaustion modal.
 * @param {string} tier — user tier (free, starter, pro, ultra)
 * @param {string} [exhaustion] — 'daily' or 'monthly'
 */
export function showCreditsGate(tier, exhaustion) {
  if (gateOpen) return Promise.resolve(null)
  gateOpen = true

  return new Promise((resolve) => {
    const host = document.createElement('div')
    const shadow = host.attachShadow({ mode: 'closed' })

    function close() {
      gateOpen = false
      document.removeEventListener('keydown', onKey)
      host.remove()
      resolve(null)
    }

    const style = document.createElement('style')
    style.textContent = STYLES
    shadow.appendChild(style)

    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    overlay.addEventListener('click', close)
    shadow.appendChild(overlay)

    const card = document.createElement('div')
    card.className = 'card'
    card.addEventListener('click', (e) => e.stopPropagation())
    shadow.appendChild(card)

    const closeBtn = document.createElement('button')
    closeBtn.className = 'close-btn'
    closeBtn.innerHTML = '&#x2715;'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.addEventListener('click', close)
    card.appendChild(closeBtn)

    const body = document.createElement('div')
    body.className = 'body'

    if (PAID_TIERS.includes(tier)) {
      body.innerHTML = buildPaidContent(tier)
    } else if (exhaustion === 'monthly') {
      body.innerHTML = buildFreeMonthlyContent()
    } else {
      body.innerHTML = buildFreeDailyContent()
    }

    card.appendChild(body)

    body.querySelectorAll('a.btn, a.plan-select').forEach((a) => {
      a.addEventListener('click', () => setTimeout(close, 300))
    })

    const footer = document.createElement('div')
    footer.className = 'footer'
    footer.innerHTML = 'Powered by <span>Whacka</span>'
    card.appendChild(footer)

    function onKey(e) { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)

    document.body.appendChild(host)
  })
}
