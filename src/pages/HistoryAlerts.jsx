import { useState, useMemo } from 'react'
import { t } from '../i18n'
import { Clock, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Bell, PhoneCall } from 'lucide-react'
import { format, subDays } from 'date-fns'

export default function HistoryAlerts({ lang, doseLog, medicines, patientContact, showToast }) {

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

  const [tab, setTab] = useState('history')
  const today = format(new Date(), 'yyyy-MM-dd')

  const sortedLog = useMemo(() => {
    return [...doseLog].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return b.time?.localeCompare(a.time) || 0
    })
  }, [doseLog])

  const groupedLog = useMemo(() => {
    const groups = {}
    sortedLog.forEach(log => {
      const dateKey = log.date
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(log)
    })
    return groups
  }, [sortedLog])

  const alerts = useMemo(() => {
    const items = []
    const now = format(new Date(), 'HH:mm')

    medicines.forEach(med => {
      (med.times || []).forEach(time => {
        if (time < now) {
          const logKey = `${med.id}-${time}`
          const logged = doseLog.some(l => l.key === logKey && l.date === today)
          if (!logged) {
            items.push({
              type: 'missed',
              icon: AlertCircle,
              label: t('missedDose', lang),
              detail: `${med.name} · ${time}`,
              colorVar: '--color-danger',
              actions: ['reminder', 'call'],
            })
          }
        }
      })

      if (!med.synced) {
        items.push({
          type: 'unsync',
          icon: RefreshCw,
          label: t('scheduleNotSynced', lang),
          detail: med.name,
          colorVar: '--color-warning',
          actions: ['sync'],
        })
      }
    })

    return items
  }, [medicines, doseLog, today, lang])

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={15} style={{ color: 'rgb(var(--color-success))' }} />
      case 'skipped': return <AlertTriangle size={15} style={{ color: 'rgb(var(--color-warning))' }} />
      case 'missed': return <AlertCircle size={15} style={{ color: 'rgb(var(--color-danger))' }} />
      default: return <Clock size={15} style={{ color: 'rgb(var(--color-text-light))' }} />
    }
  }

  const statusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'skipped': return 'status-delayed'
      case 'missed': return 'status-missed'
      default: return 'status-upcoming'
    }
  }

  const formatDateLabel = (dateStr) => {
    if (dateStr === today) return t('today', lang)
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    if (dateStr === yesterday) return lang === 'en' ? 'Yesterday' : dateStr
    return dateStr
  }

  return (
    <div className="page-bg min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-sage absolute w-44 h-44" style={{ top: '-3%', left: '-15%' }} />
      <div className="warm-orb warm-orb-blush absolute w-32 h-32" style={{ top: '8%', right: '-10%' }} />

      {/* Header with generous space */}
      <div className="pt-10 pb-5 animate-fade-in-up relative z-10">
        <span className="text-3xl">{tab === 'history' ? '📊' : '⚠️'}</span>
        <h1 className="text-[28px] font-bold mt-3" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          {tab === 'history' ? t('history', lang) : t('alerts', lang)}
        </h1>
      </div>

      {/* Tab switcher */}
      <div className="glass-pill p-1.5 flex gap-1 mb-7 animate-fade-in-up stagger-1 relative z-10">
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-3 rounded-full text-[14px] font-bold transition-all ${
            tab === 'history'
              ? 'bg-white shadow-md text-primary'
              : ''
          }`}
          style={{ color: tab === 'history' ? 'rgb(92,140,126)' : 'rgb(var(--color-text-light))' }}
        >
          {t('history', lang)}
        </button>
        <button
          onClick={() => setTab('alerts')}
          className={`flex-1 py-3 rounded-full text-[14px] font-bold transition-all relative ${
            tab === 'alerts'
              ? 'bg-white shadow-md text-primary'
              : ''
          }`}
          style={{ color: tab === 'alerts' ? 'rgb(92,140,126)' : 'rgb(var(--color-text-light))' }}
        >
          {t('alerts', lang)}
          {alerts.length > 0 && (
            <span className="absolute -top-1.5 -right-1 w-5.5 h-5.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ background: 'rgb(var(--color-danger))', width: 22, height: 22 }}>
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'history' ? (
        <div className="animate-fade-in relative z-10">
          {Object.keys(groupedLog).length === 0 ? (
            <div className="text-center py-24">
              <div className="w-28 h-28 rounded-[32px] mx-auto mb-6 flex items-center justify-center glass-hero">
                <Clock size={40} className="text-primary" style={{ opacity: 0.3 }} strokeWidth={1.3} />
              </div>
              <p className="font-bold text-[16px]" style={{ color: 'rgb(var(--color-text-light))' }}>
                {t('noDosesToday', lang)}
              </p>
            </div>
          ) : (
            Object.entries(groupedLog).map(([date, logs]) => (
              <div key={date} className="mb-7">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4 px-1"
                  style={{ color: 'rgb(var(--color-text-light))' }}>
                  {formatDateLabel(date)}
                </h3>
                <div className="space-y-2.5">
                  {logs.map((log, i) => (
                    <div key={i} className="glass-card-solid p-5 flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {statusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px]">{log.name}</p>
                        <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                          {log.time}
                        </p>
                      </div>
                      <span className={`status-pill text-[10px] ${statusClass(log.status)}`}>
                        {log.status === 'completed' ? t('completed', lang) :
                         log.status === 'skipped' ? t('skip', lang) :
                         log.status === 'missed' ? t('missed', lang) :
                         t('upcoming', lang)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="animate-fade-in relative z-10">
          {alerts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-28 h-28 rounded-[32px] mx-auto mb-6 flex items-center justify-center glass-hero"
                style={{ background: 'rgba(120,180,130,0.06)' }}>
                <CheckCircle2 size={40} style={{ color: 'rgb(var(--color-success))', opacity: 0.4 }} strokeWidth={1.3} />
              </div>
              <p className="font-bold text-[16px]" style={{ color: 'rgb(var(--color-success))' }}>
                {t('allGoodToday', lang)}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {alerts.map((alert, i) => {
                const Icon = alert.icon
                return (
                  <div key={i} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${0.07 * i}s`, opacity: 0 }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0"
                        style={{ background: `rgba(${alert.colorVar === '--color-danger' ? '198,108,105' : '218,170,95'}, 0.08)` }}>
                        <Icon size={20} style={{ color: `rgb(var(${alert.colorVar}))` }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[15px]">{alert.label}</p>
                        <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                          {alert.detail}
                        </p>
                        <div className="flex gap-3 mt-4">
                          {alert.actions.includes('reminder') && (
                            <button onClick={() => handleReminder(alert.detail.split(' · ')[0])} className="btn-soft text-[13px] py-3 px-5 flex items-center gap-2 rounded-2xl flex-1 justify-center">
                              <Bell size={14} /> {t('sendReminder', lang)}
                            </button>
                          )}
                          {alert.actions.includes('call') && (
                            <button onClick={handleCall} className="btn-warm text-[13px] py-3 px-5 flex items-center gap-2 rounded-2xl flex-1 justify-center">
                              <PhoneCall size={14} /> {t('call', lang)}
                            </button>
                          )}
                          {alert.actions.includes('sync') && (
                            <button className="btn-soft text-[13px] py-3 px-5 flex items-center gap-2 rounded-2xl flex-1 justify-center">
                              <RefreshCw size={14} /> {t('syncNow', lang)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="h-10" />
    </div>
  )
}
