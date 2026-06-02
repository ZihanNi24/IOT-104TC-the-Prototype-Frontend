import { languages } from '../i18n'
import { Globe } from 'lucide-react'

export default function LanguageSelect({ onSelect }) {
  return (
    <div className="h-full page-bg-center flex flex-col px-6 overflow-y-auto no-scrollbar relative">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Decorative floating orbs */}
      <div className="warm-orb warm-orb-sage absolute w-40 h-40" style={{ top: '8%', right: '-10%' }} />
      <div className="warm-orb warm-orb-peach absolute w-32 h-32" style={{ top: '15%', left: '-5%' }} />
      <div className="warm-orb warm-orb-lavender absolute w-28 h-28" style={{ bottom: '20%', right: '5%' }} />

      {/* Top third breathing space */}
      <div className="flex-shrink-0" style={{ height: '22vh' }} />

      <div className="animate-fade-in-up flex flex-col items-center mb-10 relative z-10">
        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-6 glass-hero animate-float"
          style={{ background: 'linear-gradient(160deg, rgba(200,220,208,0.5), rgba(248,232,218,0.3), rgba(222,216,235,0.2))' }}>
          <Globe size={40} className="text-primary" strokeWidth={1.3} />
        </div>
        <h1 className="text-[32px] font-bold text-center leading-tight" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          Welcome
        </h1>
        <p className="text-[15px] mt-3 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
          Choose your language
        </p>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-2.5 pb-16 relative z-10">
        {languages.map((lang, i) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="w-full glass-card flex items-center gap-4 px-6 py-[18px] active:scale-[0.97] transition-all animate-fade-in-up"
            style={{ animationDelay: `${0.05 * i}s`, opacity: 0 }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, rgba(92,140,126,0.1), rgba(186,146,112,0.06))' }}>
              <span className="text-[11px] font-extrabold uppercase text-primary tracking-wide">{lang.code}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-[16px]">{lang.native}</div>
              <div className="text-[12px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>{lang.name}</div>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(92,140,126,0.06)' }}>
              <span className="text-primary text-sm font-light">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
