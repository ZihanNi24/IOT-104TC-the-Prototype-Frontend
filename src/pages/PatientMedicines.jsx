import { useState } from 'react'
import { t } from '../i18n'
import { Pill, Plus, Trash2 } from 'lucide-react'
import MedicineForm from '../components/MedicineForm'

export default function PatientMedicines({ lang, medicines, setMedicines }) {
  const [showForm, setShowForm] = useState(false)
  const [editingMed, setEditingMed] = useState(null)

  const handleDelete = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id))
  }

  const handleEdit = (med) => {
    setEditingMed(med)
    setShowForm(true)
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

  return (
    <div className="page-bg min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-sage absolute w-44 h-44" style={{ top: '-3%', right: '-15%' }} />
      <div className="warm-orb warm-orb-lavender absolute w-32 h-32" style={{ top: '25%', left: '-10%' }} />

      {/* Header with generous top space */}
      <div className="pt-10 pb-6 flex items-end justify-between animate-fade-in-up relative z-10">
        <div>
          <span className="text-3xl">💊</span>
          <h1 className="text-[28px] font-bold mt-3" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {t('myMedicines', lang)}
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
          <p className="text-[14px] mt-2" style={{ color: 'rgb(var(--color-text-light))', opacity: 0.6 }}>
            {lang === 'zh' ? '扫描医嘱或手动添加' : 'Scan a prescription or add manually'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 mt-2 relative z-10">
          {medicines.map((med, i) => (
            <div
              key={med.id}
              className="glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: `${0.07 * i}s`, opacity: 0 }}
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-[20px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(145deg, rgba(92,140,126,0.1), rgba(200,220,208,0.15))' }}>
                  <Pill size={22} className="text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[18px] mb-3">{med.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[14px]">
                      <span className="font-semibold w-18" style={{ color: 'rgb(var(--color-text-light))', width: 72 }}>
                        {t('howMany', lang)}
                      </span>
                      <span className="font-bold">
                        {med.dose} {parseInt(med.dose) > 1 ? t('pillsUnit', lang) : t('pill', lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[14px]">
                      <span className="font-semibold" style={{ color: 'rgb(var(--color-text-light))', width: 72 }}>
                        {t('when', lang)}
                      </span>
                      <span className="font-bold">{(med.times || []).join(', ')}</span>
                    </div>
                    {med.note && (
                      <div className="flex items-center gap-3 text-[14px]">
                        <span className="font-semibold" style={{ color: 'rgb(var(--color-text-light))', width: 72 }}>
                          {t('notes', lang)}
                        </span>
                        <span className="font-bold">{med.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="soft-divider mt-4 mb-3" />
              <div className="flex justify-end gap-3">
                <button onClick={() => handleEdit(med)}
                  className="text-[13px] text-primary font-bold px-5 py-2.5 rounded-2xl active:bg-primary/5 transition-colors">
                  {t('edit', lang)}
                </button>
                <button onClick={() => handleDelete(med.id)}
                  className="text-[13px] font-bold px-4 py-2.5 rounded-2xl transition-opacity"
                  style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
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
