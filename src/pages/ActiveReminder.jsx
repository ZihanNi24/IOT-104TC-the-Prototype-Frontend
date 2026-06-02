import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { t } from '../i18n'
import { BellRing, Box, CheckCircle2, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default function ActiveReminder({ lang, medicines, doseLog, setDoseLog }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dose = location.state?.dose
  const [phase, setPhase] = useState('remind')
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (phase === 'opened') {
      const timer = setTimeout(() => setPhase('completed'), 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const handleOpen = () => setPhase('opened')

  const handleComplete = () => {
    if (dose) {
      const logKey = `${dose.medId}-${dose.time}`
      const existing = doseLog.some(l => l.key === logKey && l.date === today)
      if (!existing) {
        setDoseLog(prev => [...prev, {
          key: logKey,
          medId: dose.medId,
          name: dose.name,
          time: dose.time,
          date: today,
          status: 'completed',
          completedAt: new Date().toISOString(),
        }])
      }
    }
    navigate('/', { replace: true })
  }

  const handleSkip = () => {
    if (dose) {
      const logKey = `${dose.medId}-${dose.time}`
      setDoseLog(prev => [...prev, {
        key: logKey,
        medId: dose.medId,
        name: dose.name,
        time: dose.time,
        date: today,
        status: 'skipped',
        completedAt: new Date().toISOString(),
      }])
    }
    navigate('/', { replace: true })
  }

  if (!dose) {
    return (
      <div className="h-full page-bg-center flex items-center justify-center px-6">
        <p className="text-[15px] font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
          {t('noDosesToday', lang)}
        </p>
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(120,180,130,0.15) 0%, transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(200,220,208,0.2) 0%, transparent 40%), rgb(var(--color-warm-cream))'
        }}>
        <div className="warm-orb warm-orb-sage absolute w-48 h-48" style={{ top: '15%', right: '-10%' }} />
        <div className="animate-fade-in-up relative z-10">
          <div className="w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center animate-glow"
            style={{ background: 'linear-gradient(150deg, rgba(120,180,130,0.2), rgba(120,180,130,0.05))' }}>
            <CheckCircle2 size={56} style={{ color: 'rgb(var(--color-success))' }} strokeWidth={1.3} />
          </div>
          <h1 className="text-[32px] font-bold mb-3" style={{
            fontFamily: 'Quicksand, sans-serif',
            color: 'rgb(var(--color-success))'
          }}>
            {t('completed', lang)} ✨
          </h1>
          <p className="text-[15px] font-medium mb-12" style={{ color: 'rgb(var(--color-text-light))' }}>
            {dose.name} · {dose.dose} {t('pill', lang)}
          </p>
          <button onClick={handleComplete} className="btn-primary px-16">
            {t('done', lang)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center px-8 text-center relative overflow-hidden"
      style={{
        background: phase === 'opened'
          ? 'radial-gradient(ellipse at 50% 30%, rgba(200,220,208,0.3) 0%, transparent 55%), rgb(var(--color-warm-cream))'
          : 'radial-gradient(ellipse at 50% 30%, rgba(248,232,218,0.4) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(222,216,235,0.15) 0%, transparent 40%), rgb(var(--color-warm-cream))'
      }}>
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-peach absolute w-44 h-44" style={{ top: '8%', right: '-10%' }} />
      <div className="warm-orb warm-orb-lavender absolute w-32 h-32" style={{ bottom: '20%', left: '-5%' }} />

      {/* Back button */}
      <button onClick={() => navigate('/', { replace: true })}
        className="absolute top-0 left-5 mt-[calc(env(safe-area-inset-top,0px)+16px)] w-11 h-11 rounded-2xl glass-card flex items-center justify-center z-20">
        <ArrowLeft size={18} style={{ color: 'rgb(var(--color-text-light))' }} />
      </button>

      {/* Centered content with generous vertical centering */}
      <div className="flex-1 flex flex-col items-center justify-center pb-24 relative z-10">
        <div className="animate-fade-in-up">
          <div className={`w-36 h-36 rounded-full mx-auto mb-10 flex items-center justify-center ${
            phase === 'remind' ? 'animate-pulse-gentle' : ''
          }`} style={{
            background: phase === 'remind'
              ? 'linear-gradient(150deg, rgba(218,170,95,0.2), rgba(218,170,95,0.04))'
              : 'linear-gradient(150deg, rgba(92,140,126,0.15), rgba(92,140,126,0.04))',
            boxShadow: phase === 'remind'
              ? '0 12px 40px rgba(218,170,95,0.1)'
              : '0 12px 40px rgba(92,140,126,0.08)',
          }}>
            {phase === 'remind' ? (
              <BellRing size={56} style={{ color: 'rgb(var(--color-warning))' }} strokeWidth={1.3} />
            ) : (
              <Box size={56} className="text-primary" strokeWidth={1.3} />
            )}
          </div>

          <h1 className="text-[26px] font-bold mb-4" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {phase === 'remind' ? t('timeToTake', lang) : t('boxOpened', lang)}
          </h1>

          <p className="text-[42px] font-bold my-6" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {dose.dose} {parseInt(dose.dose) > 1 ? t('pillsUnit', lang) : t('pill', lang)}
          </p>

          <p className="text-[20px] font-bold mb-3" style={{ opacity: 0.7 }}>{dose.name}</p>

          {phase === 'remind' && (
            <p className="text-[14px] mt-4 mb-7 max-w-[250px] mx-auto leading-relaxed font-medium"
              style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('openPillBox', lang)}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 my-7">
            <span className={`glass-pill px-6 py-3 text-[13px] font-bold flex items-center gap-2.5 ${
              phase === 'remind' ? 'status-upcoming' : 'status-completed'
            }`}>
              {phase === 'remind' ? (
                <><BellRing size={14} /> {t('reminderActive', lang)}</>
              ) : (
                <><CheckCircle2 size={14} /> {t('boxOpened', lang)}</>
              )}
            </span>
          </div>

          <div className="space-y-3.5 mt-8 w-full max-w-xs mx-auto">
            {phase === 'remind' && (
              <>
                <button onClick={handleOpen} className="btn-primary w-full">
                  {t('markDone', lang)}
                </button>
                <button onClick={handleSkip} className="btn-soft w-full">
                  {t('skip', lang)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
