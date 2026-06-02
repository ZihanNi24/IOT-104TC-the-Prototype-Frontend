import { useState } from 'react'
import { t } from '../i18n'
import { X, Plus, Trash2 } from 'lucide-react'

export default function MedicineForm({ lang, medicine, onSave, onClose }) {
  const [name, setName] = useState(medicine?.name || '')
  const [dose, setDose] = useState(medicine?.dose || '1')
  const [times, setTimes] = useState(medicine?.times || ['08:00'])
  const [note, setNote] = useState(medicine?.note || '')

  const addTime = () => setTimes(prev => [...prev, '12:00'])
  const removeTime = (i) => setTimes(prev => prev.filter((_, idx) => idx !== i))
  const updateTime = (i, val) => setTimes(prev => prev.map((t, idx) => idx === i ? val : t))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), dose, times, note: note.trim() })
  }

  const noteOptions = [
    { key: 'afterBreakfast', label: t('afterBreakfast', lang) },
    { key: 'afterLunch', label: t('afterLunch', lang) },
    { key: 'afterDinner', label: t('afterDinner', lang) },
    { key: 'beforeBed', label: t('beforeBed', lang) },
    { key: 'beforeMeals', label: t('beforeMeals', lang) },
  ]

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md rounded-t-[32px] p-7 overflow-y-auto animate-slide-up"
        style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)', background: 'rgb(var(--color-warm-cream))' }}>
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {medicine ? t('editMedicine', lang) : t('addNewMedicine', lang)}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
            <X size={17} style={{ color: 'rgb(var(--color-text-light))' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider block mb-2"
              style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('medicineName', lang)}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-glass w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider block mb-3"
              style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('dosage', lang)}
            </label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setDose(Math.max(1, parseInt(dose) - 1).toString())}
                className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">
                −
              </button>
              <span className="text-[32px] font-bold w-12 text-center" style={{ fontFamily: 'Quicksand, sans-serif' }}>{dose}</span>
              <button type="button" onClick={() => setDose((parseInt(dose) + 1).toString())}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-primary active:scale-90 transition-transform"
                style={{ background: 'rgba(92,140,126,0.1)' }}>
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider block mb-2"
              style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('when', lang)}
            </label>
            <div className="space-y-2.5">
              {times.map((timeVal, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={timeVal}
                    onChange={e => updateTime(i, e.target.value)}
                    className="input-glass flex-1"
                  />
                  {times.length > 1 && (
                    <button type="button" onClick={() => removeTime(i)}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(198,108,105,0.06)' }}>
                      <Trash2 size={14} style={{ color: 'rgb(var(--color-danger))' }} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTime}
                className="flex items-center gap-2 text-[13px] text-primary font-bold mt-2 px-2 py-1.5">
                <Plus size={15} /> {t('addMedicine', lang)}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider block mb-2"
              style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('timingNote', lang)}
            </label>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {noteOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setNote(opt.label)}
                  className={`text-[13px] px-4 py-2 rounded-2xl transition-all font-bold ${
                    note === opt.label
                      ? 'text-white'
                      : ''
                  }`}
                  style={note === opt.label
                    ? { background: 'linear-gradient(145deg, rgb(92,140,126), rgb(110,158,142))' }
                    : { background: 'rgba(0,0,0,0.03)', color: 'rgb(var(--color-text-light))' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-glass w-full"
              placeholder={t('notes', lang)}
            />
          </div>

          <button type="submit" className="btn-primary w-full text-center">
            {t('save', lang)}
          </button>
        </form>
        <div className="h-4" />
      </div>
    </div>
  )
}
