import { t } from '../i18n'
import { User, Heart } from 'lucide-react'

export default function RoleSelect({ lang, onSelect }) {
  return (
    <div className="h-full page-bg-warm flex flex-col items-center px-6 relative overflow-y-auto no-scrollbar">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Decorative warm orbs */}
      <div className="warm-orb warm-orb-peach absolute w-48 h-48" style={{ top: '5%', right: '-15%' }} />
      <div className="warm-orb warm-orb-sage absolute w-36 h-36" style={{ top: '12%', left: '-10%' }} />
      <div className="warm-orb warm-orb-blush absolute w-32 h-32" style={{ bottom: '15%', left: '10%' }} />

      {/* Top breathing space */}
      <div className="flex-shrink-0" style={{ height: '18vh' }} />

      <div className="animate-fade-in-up mb-4 text-center relative z-10">
        <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, rgba(200,220,208,0.4), rgba(248,232,218,0.3))' }}>
          <span className="text-2xl">👋</span>
        </div>
        <p className="text-[13px] font-bold tracking-wider uppercase mb-3" style={{ color: 'rgb(var(--color-text-light))' }}>
          {lang === 'zh' ? '欢迎' : lang === 'ko' ? '환영합니다' : lang === 'ja' ? 'ようこそ' : 'Welcome'}
        </p>
        <h1 className="text-[30px] font-bold leading-tight" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          {t('chooseRole', lang)}
        </h1>
      </div>

      <p className="text-[14px] mb-10 text-center max-w-[260px] leading-relaxed animate-fade-in-up stagger-1 relative z-10"
        style={{ color: 'rgb(var(--color-text-light))' }}>
        {lang === 'zh' ? '选择你的身份，随时可以切换' : lang === 'ko' ? '언제든 설정에서 변경할 수 있어요' : lang === 'ja' ? '設定からいつでも変更できます' : 'You can switch roles anytime in settings'}
      </p>

      <div className="w-full max-w-sm space-y-5 relative z-10">
        <button
          onClick={() => onSelect('patient')}
          className="w-full glass-hero p-8 flex flex-col items-center text-center active:scale-[0.97] transition-all animate-fade-in-up stagger-2"
        >
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-5 animate-float"
            style={{
              background: 'linear-gradient(150deg, rgba(200,220,208,0.5), rgba(92,140,126,0.1))',
              boxShadow: '0 8px 24px rgba(92,140,126,0.1)',
            }}>
            <User size={32} className="text-primary" strokeWidth={1.4} />
          </div>
          <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {t('patient', lang)}
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'rgb(var(--color-text-light))' }}>
            {t('patientDesc', lang)}
          </p>
        </button>

        <button
          onClick={() => onSelect('caregiver')}
          className="w-full glass-hero p-8 flex flex-col items-center text-center active:scale-[0.97] transition-all animate-fade-in-up stagger-3"
        >
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-5 animate-float"
            style={{
              animationDelay: '0.3s',
              background: 'linear-gradient(150deg, rgba(248,232,218,0.6), rgba(186,146,112,0.1))',
              boxShadow: '0 8px 24px rgba(186,146,112,0.08)',
            }}>
            <Heart size={32} className="text-secondary" strokeWidth={1.4} />
          </div>
          <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {t('caregiver', lang)}
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'rgb(var(--color-text-light))' }}>
            {t('caregiverDesc', lang)}
          </p>
        </button>
      </div>

      {/* Bottom safe area */}
      <div className="flex-shrink-0 h-20" />
    </div>
  )
}
