import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { Pill, Wifi, CheckCircle2, Clock, Sun, Moon, Sunset } from 'lucide-react'
import { format } from 'date-fns'

function getTimeSlot(timeStr) {
  if (!timeStr) return 'morning'
  const h = parseInt(timeStr.split(':')[0])
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'night'
}

function getTimeIcon(slot) {
  if (slot === 'morning') return Sun
  if (slot === 'afternoon') return Sunset
  return Moon
}

export default function PatientHome({ lang, medicines, doseLog, setDoseLog }) {
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')

  const todaySchedule = useMemo(() => {
    return medicines.flatMap(med => {
      return (med.times || []).map(time => ({
        medId: med.id,
        name: med.name,
        dose: med.dose,
        time,
        note: med.note,
        slot: getTimeSlot(time),
      }))
    }).sort((a, b) => a.time.localeCompare(b.time))
  }, [medicines])

  const todayLogs = doseLog.filter(l => l.date === today)
  const completedCount = todayLogs.filter(l => l.status === 'completed').length
  const totalDoses = todaySchedule.length

  const nextDose = useMemo(() => {
    const now = format(new Date(), 'HH:mm')
    return todaySchedule.find(d => {
      const logKey = `${d.medId}-${d.time}`
      const done = todayLogs.some(l => l.key === logKey)
      return !done && d.time >= now
    })
  }, [todaySchedule, todayLogs])

  const allDone = totalDoses > 0 && completedCount >= totalDoses

  const handleMarkDone = (dose) => {
    const logKey = `${dose.medId}-${dose.time}`
    if (todayLogs.some(l => l.key === logKey)) return
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

  const greetingEmoji = () => {
    const h = new Date().getHours()
    if (h < 12) return '🌅'
    if (h < 18) return '☀️'
    return '🌙'
  }

  const greetingText = () => {
    const h = new Date().getHours()
    if (lang === 'zh') {
      if (h < 12) return '早上好'
      if (h < 18) return '下午好'
      return '晚上好'
    }
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page-bg min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Decorative warm orbs */}
      <div className="warm-orb warm-orb-sage absolute w-52 h-52" style={{ top: '-5%', right: '-20%' }} />
      <div className="warm-orb warm-orb-peach absolute w-40 h-40" style={{ top: '3%', left: '-15%' }} />

      {/* Generous top breathing space with warm greeting */}
      <div className="pt-10 pb-8 animate-fade-in-up relative z-10">
        <div className="mb-4">
          <span className="text-5xl">{greetingEmoji()}</span>
        </div>
        <h1 className="text-[32px] font-bold mt-4 mb-2 leading-tight" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          {greetingText()}
        </h1>
        <p className="text-[15px] font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Progress hero card */}
      <div className="glass-hero p-7 mb-5 animate-fade-in-up stagger-1 relative z-10">
        {allDone ? (
          <div className="text-center py-5">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-[24px] font-bold" style={{ color: 'rgb(var(--color-success))', fontFamily: 'Quicksand, sans-serif' }}>
              {t('allDone', lang)}
            </p>
            <p className="text-[14px] mt-2" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('dosesCompleted', lang, { done: completedCount, total: totalDoses })}
            </p>
          </div>
        ) : totalDoses === 0 ? (
          <div className="text-center py-5">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-[20px] font-bold" style={{ color: 'rgb(var(--color-text-light))', fontFamily: 'Quicksand, sans-serif' }}>
              {t('noDosesToday', lang)}
            </p>
            <p className="text-[14px] mt-2" style={{ color: 'rgb(var(--color-text-light))' }}>
              {lang === 'zh' ? '扫描医嘱添加计划' : 'Scan a prescription to get started'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {t('today', lang)}
                </span>
                <p className="text-[36px] font-bold mt-1 leading-none" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  <span className="text-primary">{completedCount}</span>
                  <span className="mx-1.5" style={{ color: 'rgb(var(--color-text-light))', opacity: 0.3 }}>/</span>
                  <span style={{ color: 'rgb(var(--color-text-light))', opacity: 0.35 }}>{totalDoses}</span>
                </p>
              </div>
              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center animate-glow"
                style={{ background: 'linear-gradient(145deg, rgba(120,180,130,0.15), rgba(92,140,126,0.06))' }}>
                <CheckCircle2 size={30} style={{ color: 'rgb(var(--color-success))' }} strokeWidth={1.4} />
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(completedCount / totalDoses) * 100}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Device status pill */}
      <div className="glass-pill px-6 py-3.5 mb-6 flex items-center gap-3 animate-fade-in-up stagger-2 relative z-10">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(120,180,130,0.12)' }}>
          <Wifi size={14} style={{ color: 'rgb(var(--color-success))' }} strokeWidth={2.5} />
        </div>
        <span className="text-[14px] font-bold" style={{ color: 'rgb(var(--color-success))' }}>
          {t('pillBoxReady', lang)}
        </span>
      </div>

      {/* Next dose card */}
      {nextDose && (
        <div className="glass-card p-7 mb-6 animate-fade-in-up stagger-3 relative z-10 overflow-hidden">
          {/* Subtle accent strip */}
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[28px]"
            style={{ background: 'linear-gradient(90deg, rgb(92,140,126), rgb(120,180,130), rgba(200,220,208,0.5))' }} />
          
          <div className="flex items-start gap-5 mt-1">
            <div className="w-16 h-16 rounded-[22px] flex items-center justify-center animate-pulse-gentle"
              style={{ background: 'linear-gradient(145deg, rgb(92,140,126), rgb(110,158,142))',
                boxShadow: '0 8px 24px rgba(92,140,126,0.2)' }}>
              <Pill size={26} className="text-white" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'rgb(var(--color-text-light))' }}>
                {t('nextMedicine', lang)}
              </p>
              <p className="text-[22px] font-bold leading-tight" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {nextDose.name}
              </p>
              <p className="text-[14px] mt-2 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                {nextDose.time} · {nextDose.dose} {parseInt(nextDose.dose) > 1 ? t('pillsUnit', lang) : t('pill', lang)}
                {nextDose.note ? ` · ${nextDose.note}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reminder', { state: { dose: nextDose } })}
            className="btn-primary w-full mt-6 text-center"
          >
            {t('markDone', lang)}
          </button>
        </div>
      )}

      {/* Today's schedule */}
      {todaySchedule.length > 0 && (
        <div className="mb-10 animate-fade-in-up stagger-4 relative z-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4 px-1"
            style={{ color: 'rgb(var(--color-text-light))' }}>
            {t('todaySchedule', lang) || t('today', lang)}
          </h2>
          <div className="space-y-3">
            {todaySchedule.map((dose, i) => {
              const logKey = `${dose.medId}-${dose.time}`
              const isDone = todayLogs.some(l => l.key === logKey && l.status === 'completed')
              const now = format(new Date(), 'HH:mm')
              const isPast = dose.time < now && !isDone
              const Icon = getTimeIcon(dose.slot)

              return (
                <div key={i} className={`glass-card-solid p-5 flex items-center gap-4 transition-all ${isDone ? 'opacity-40' : ''}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isDone
                        ? 'rgba(120,180,130,0.1)'
                        : isPast
                          ? 'rgba(198,108,105,0.08)'
                          : 'rgba(218,170,95,0.1)'
                    }}>
                    {isDone ? (
                      <CheckCircle2 size={20} style={{ color: 'rgb(var(--color-success))' }} />
                    ) : (
                      <Icon size={20} style={{ color: isPast ? 'rgb(var(--color-danger))' : 'rgb(var(--color-warning))' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-[16px] ${isDone ? 'line-through' : ''}`}>{dose.name}</p>
                    <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                      {dose.time} · {dose.dose} {t('pill', lang)}
                    </p>
                  </div>
                  {!isDone && (
                    <button
                      onClick={() => handleMarkDone(dose)}
                      className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                      style={{ background: 'rgba(92,140,126,0.08)' }}
                    >
                      <CheckCircle2 size={20} className="text-primary" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
