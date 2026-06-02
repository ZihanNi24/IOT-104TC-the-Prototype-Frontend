import { useState, useMemo } from 'react'
import { t } from '../i18n'
import { Sun, Sunset, Moon, Plus, Pill, Edit3, Trash2 } from 'lucide-react'
import MedicineForm from '../components/MedicineForm'

function getTimeSlot(timeStr) {
  const h = parseInt(timeStr.split(':')[0])
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'night'
}

export default function MedicationPlan({ lang, medicines, setMedicines }) {
  const [showForm, setShowForm] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [syncingId, setSyncingId] = useState(null)

  const groupedSchedule = useMemo(() => {
    const groups = { morning: [], afternoon: [], night: [] }
    medicines.forEach(med => {
      (med.times || []).forEach(time => {
        const slot = getTimeSlot(time)
        groups[slot].push({
          medId: med.id,
          name: med.name,
          dose: med.dose,
          time,
          note: med.note,
          synced: med.synced,
        })
      })
    })
    Object.keys(groups).forEach(k => groups[k].sort((a, b) => a.time.localeCompare(b.time)))
    return groups
  }, [medicines])

  const slotConfig = [
    { key: 'morning', icon: Sun, label: t('morning', lang), bg: 'rgba(218,170,95,0.08)', iconColor: 'rgb(var(--color-warning))' },
    { key: 'afternoon', icon: Sunset, label: t('afternoon', lang), bg: 'rgba(92,140,126,0.08)', iconColor: 'rgb(92,140,126)' },
    { key: 'night', icon: Moon, label: t('night', lang), bg: 'rgba(150,140,180,0.08)', iconColor: 'rgb(150,140,180)' },
  ]

  const handleSync = (medId) => {
    setSyncingId(medId)
    setTimeout(() => {
      setMedicines(prev => prev.map(m => m.id === medId ? { ...m, synced: true } : m))
      setSyncingId(null)
    }, 1200)
  }

  const handleSave = (med) => {
    if (editingMed) {
      setMedicines(prev => prev.map(m => m.id === editingMed.id ? { ...med, id: editingMed.id } : m))
    } else {
      setMedicines(prev => [...prev, { ...med, id: Date.now().toString() }])
    }
    setShowForm(false)
    setEditingMed(null)
  }

  const handleDelete = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="page-bg-warm min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-peach absolute w-44 h-44" style={{ top: '-3%', right: '-15%' }} />
      <div className="warm-orb warm-orb-sage absolute w-36 h-36" style={{ top: '15%', left: '-12%' }} />

      {/* Header */}
      <div className="pt-10 pb-6 flex items-end justify-between animate-fade-in-up relative z-10">
        <div>
          <span className="text-3xl">📋</span>
          <h1 className="text-[26px] font-bold mt-3" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {t('medicationPlan', lang)}
          </h1>
        </div>
        <button
          onClick={() => { setEditingMed(null); setShowForm(true) }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card active:scale-90 transition-transform"
        >
          <Plus size={22} className="text-primary" />
        </button>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-24 animate-fade-in-up stagger-1 relative z-10">
          <div className="w-28 h-28 rounded-[32px] mx-auto mb-6 flex items-center justify-center glass-hero">
            <Pill size={40} className="text-primary" style={{ opacity: 0.3 }} strokeWidth={1.3} />
          </div>
          <p className="font-bold text-[16px]" style={{ color: 'rgb(var(--color-text-light))' }}>
            {t('addMedicine', lang)}
          </p>
        </div>
      ) : (
        <div className="space-y-7 mt-2 relative z-10">
          {slotConfig.map(({ key, icon: SlotIcon, label, bg, iconColor }) => {
            const items = groupedSchedule[key]
            if (items.length === 0) return null
            return (
              <div key={key} className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <SlotIcon size={16} style={{ color: iconColor }} />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: 'rgb(var(--color-text-light))' }}>{label}</span>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={`${item.medId}-${item.time}-${i}`} className="glass-card-solid p-5 flex items-center gap-4">
                      <div className="text-[14px] font-bold w-14 text-right" style={{ color: 'rgb(var(--color-text-light))' }}>
                        {item.time}
                      </div>
                      <div className="w-[1.5px] h-9 rounded-full" style={{ background: 'rgba(92,140,126,0.08)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[16px]">{item.name}</p>
                        <p className="text-[13px] font-medium mt-0.5" style={{ color: 'rgb(var(--color-text-light))' }}>
                          {item.dose} {t('pill', lang)}{item.note ? ` · ${item.note}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.synced ? (
                          <span className="text-[10px] font-bold px-3.5 py-2 rounded-full"
                            style={{ background: 'rgba(120,180,130,0.1)', color: 'rgb(var(--color-success))' }}>
                            {t('synced', lang)}
                          </span>
                        ) : syncingId === item.medId ? (
                          <span className="text-[10px] font-bold px-3.5 py-2 rounded-full bg-primary/10 text-primary animate-breathe">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSync(item.medId)}
                            className="text-[10px] font-bold px-3.5 py-2 rounded-full bg-primary/10 text-primary active:scale-90 transition-transform"
                          >
                            {t('syncToPillBox', lang)}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const med = medicines.find(m => m.id === item.medId)
                            if (med) { setEditingMed(med); setShowForm(true) }
                          }}
                          className="p-2.5 rounded-xl active:bg-black/3 transition-colors"
                          style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.medId)}
                          className="p-2.5 rounded-xl active:bg-black/3 transition-colors"
                          style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="h-10" />

      {showForm && (
        <MedicineForm
          lang={lang}
          medicine={editingMed}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingMed(null) }}
        />
      )}
    </div>
  )
}
