import { useMemo } from 'react'
import { t } from '../i18n'
import { CheckCircle2, AlertCircle, Clock, Wifi, WifiOff, PhoneCall, Bell, Shield, Heart } from 'lucide-react'
import { format } from 'date-fns'

export default function CaregiverHome({ lang, medicines, doseLog, setDoseLog, patientContact, showToast }) {

  const handleCall = () => {
    if (!patientContact?.phone) {
      showToast(t('noPhoneSet', lang))
      return
    }
    window.location.href = `tel:${patientContact.phone}`
  }

  const handleReminder = (medName) => {
    if (!patientContact?.phone) {
      showToast(t('noPhoneSet', lang))
      return
    }
    // Open SMS with pre-filled reminder message
    const name = patientContact.name || t('patient', lang)
    const msg = encodeURIComponent(
      lang === 'zh' ? `${name}，该吃药了：${medName}。请记得按时服用哦！` :
      lang === 'ko' ? `${name}님, 약 복용 시간입니다: ${medName}. 잊지 마세요!` :
      lang === 'ja' ? `${name}さん、お薬の時間です：${medName}。忘れずに服用してください。` :
      `Hi ${name}, it's time to take your medicine: ${medName}. Please don't forget!`
    )
    window.location.href = `sms:${patientContact.phone}?body=${msg}`
    showToast(t('reminderSent', lang))
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const deviceOnline = true

  const todaySchedule = useMemo(() => {
    return medicines.flatMap(med =>
      (med.times || []).map(time => ({
        medId: med.id,
        name: med.name,
        dose: med.dose,
        time,
        note: med.note,
      }))
    ).sort((a, b) => a.time.localeCompare(b.time))
  }, [medicines])

  const todayLogs = doseLog.filter(l => l.date === today)
  const completedCount = todayLogs.filter(l => l.status === 'completed').length
  const now = format(new Date(), 'HH:mm')

  const missedDoses = todaySchedule.filter(d => {
    const logKey = `${d.medId}-${d.time}`
    const logged = todayLogs.some(l => l.key === logKey)
    return !logged && d.time < now
  })

  const nextDose = todaySchedule.find(d => {
    const logKey = `${d.medId}-${d.time}`
    return !todayLogs.some(l => l.key === logKey) && d.time >= now
  })

  const hasIssues = missedDoses.length > 0 || !deviceOnline
  const totalDoses = todaySchedule.length

  return (
    <div className="page-bg-warm min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Decorative orbs */}
      <div className="warm-orb warm-orb-peach absolute w-52 h-52" style={{ top: '-5%', right: '-18%' }} />
      <div className="warm-orb warm-orb-sage absolute w-36 h-36" style={{ top: '5%', left: '-12%' }} />
      <div className="warm-orb warm-orb-blush absolute w-28 h-28" style={{ bottom: '25%', right: '-5%' }} />

      {/* Generous top breathing space */}
      <div className="pt-10 pb-6 animate-fade-in-up relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-[20px] flex items-center justify-center"
            style={{ background: 'linear-gradient(150deg, rgba(248,232,218,0.6), rgba(186,146,112,0.12))',
              boxShadow: '0 6px 20px rgba(186,146,112,0.08)' }}>
            <Heart size={24} className="text-secondary" strokeWidth={1.4} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold leading-tight" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              {t('careStatus', lang)}
            </h1>
            <p className="text-[13px] font-medium mt-0.5" style={{ color: 'rgb(var(--color-text-light))' }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
      </div>

      {/* Status hero card */}
      <div className="glass-hero p-7 mb-6 animate-fade-in-up stagger-1 overflow-hidden relative z-10">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[32px]"
          style={{
            background: hasIssues
              ? 'linear-gradient(90deg, rgb(var(--color-danger)), rgba(var(--color-danger), 0.3))'
              : 'linear-gradient(90deg, rgb(var(--color-success)), rgba(120,180,130,0.3))'
          }} />
        <div className="flex items-center gap-5 mt-1">
          <div className="w-16 h-16 rounded-[22px] flex items-center justify-center"
            style={{
              background: hasIssues
                ? 'rgba(var(--color-danger), 0.08)'
                : 'rgba(var(--color-success), 0.08)',
              boxShadow: hasIssues
                ? '0 6px 20px rgba(198,108,105,0.08)'
                : '0 6px 20px rgba(120,180,130,0.08)',
            }}>
            {hasIssues ? (
              <AlertCircle size={28} style={{ color: 'rgb(var(--color-danger))' }} strokeWidth={1.5} />
            ) : (
              <Shield size={28} style={{ color: 'rgb(var(--color-success))' }} strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h2 className="text-[22px] font-bold" style={{
              fontFamily: 'Quicksand, sans-serif',
              color: hasIssues ? 'rgb(var(--color-danger))' : 'rgb(var(--color-success))'
            }}>
              {hasIssues ? t('needsAttention', lang) : t('allGoodToday', lang)}
            </h2>
            <p className="text-[14px] mt-1 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('dosesCompleted', lang, { done: completedCount, total: totalDoses })}
            </p>
          </div>
        </div>
      </div>

      {/* Four status cards in a grid */}
      <div className="grid grid-cols-2 gap-3.5 mb-6 relative z-10">
        <div className="glass-card p-6 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(120,180,130,0.1)' }}>
              <CheckCircle2 size={15} style={{ color: 'rgb(var(--color-success))' }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('completed', lang)}
            </span>
          </div>
          <p className="text-[34px] font-bold leading-none" style={{ fontFamily: 'Quicksand, sans-serif' }}>{completedCount}</p>
        </div>

        <div className="glass-card p-6 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: missedDoses.length > 0 ? 'rgba(198,108,105,0.08)' : 'rgba(0,0,0,0.03)' }}>
              <AlertCircle size={15} style={{ color: missedDoses.length > 0 ? 'rgb(var(--color-danger))' : 'rgb(var(--color-text-light))' }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('missed', lang)}
            </span>
          </div>
          <p className="text-[34px] font-bold leading-none" style={{
            fontFamily: 'Quicksand, sans-serif',
            color: missedDoses.length > 0 ? 'rgb(var(--color-danger))' : undefined
          }}>
            {missedDoses.length}
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(218,170,95,0.1)' }}>
              <Clock size={15} style={{ color: 'rgb(var(--color-warning))' }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('nextDose', lang)}
            </span>
          </div>
          <p className="text-[22px] font-bold leading-none" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {nextDose ? nextDose.time : '—'}
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: deviceOnline ? 'rgba(120,180,130,0.1)' : 'rgba(198,108,105,0.08)' }}>
              {deviceOnline ? (
                <Wifi size={15} style={{ color: 'rgb(var(--color-success))' }} />
              ) : (
                <WifiOff size={15} style={{ color: 'rgb(var(--color-danger))' }} />
              )}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('device', lang)}
            </span>
          </div>
          <p className="text-[22px] font-bold leading-none" style={{
            fontFamily: 'Quicksand, sans-serif',
            color: deviceOnline ? 'rgb(var(--color-success))' : 'rgb(var(--color-danger))'
          }}>
            {deviceOnline ? t('online', lang) : t('offline', lang)}
          </p>
        </div>
      </div>

      {/* Missed alerts */}
      {missedDoses.length > 0 && (
        <div className="mb-6 animate-fade-in-up stagger-4 relative z-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4 px-1"
            style={{ color: 'rgb(var(--color-text-light))' }}>
            {t('alerts', lang)}
          </h2>
          {missedDoses.map((dose, i) => (
            <div key={i} className="glass-card p-6 mb-3 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-[28px]" style={{ background: 'rgb(var(--color-danger))' }} />
              <div className="pl-3">
                <p className="font-bold text-[16px]">{dose.name}</p>
                <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {dose.time} · {t('missedDose', lang)}
                </p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleReminder(dose.name)} className="btn-soft text-[13px] flex items-center gap-2 flex-1 justify-center py-3.5 rounded-2xl">
                    <Bell size={15} /> {t('sendReminder', lang)}
                  </button>
                  <button onClick={handleCall} className="btn-warm text-[13px] flex items-center gap-2 flex-1 justify-center py-3.5 rounded-2xl">
                    <PhoneCall size={15} /> {t('call', lang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today timeline */}
      {todaySchedule.length > 0 && (
        <div className="mb-10 animate-fade-in-up stagger-5 relative z-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4 px-1"
            style={{ color: 'rgb(var(--color-text-light))' }}>
            {t('today', lang)}
          </h2>
          <div className="space-y-2.5">
            {todaySchedule.map((dose, i) => {
              const logKey = `${dose.medId}-${dose.time}`
              const log = todayLogs.find(l => l.key === logKey)
              const isDone = log?.status === 'completed'
              const isMissed = !log && dose.time < now

              return (
                <div key={i} className="glass-card-solid p-4.5 flex items-center gap-4"
                  style={{ padding: '18px' }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: isDone
                        ? 'rgb(var(--color-success))'
                        : isMissed
                          ? 'rgb(var(--color-danger))'
                          : 'rgb(var(--color-warning))'
                    }} />
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold text-[14px] ${isDone ? 'line-through opacity-40' : ''}`}>
                      {dose.time}
                    </span>
                    <span className="mx-2.5 opacity-12">—</span>
                    <span className={`text-[14px] font-medium ${isDone ? 'line-through opacity-40' : ''}`}>
                      {dose.name}, {dose.dose} {t('pill', lang)}
                    </span>
                  </div>
                  {isDone && <span className="status-pill status-completed text-[10px]">{t('completed', lang)}</span>}
                  {isMissed && <span className="status-pill status-missed text-[10px]">{t('missed', lang)}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
