import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { Pill, Check, AlertTriangle, RefreshCw, Eye, X, ArrowLeft, FileText, Edit3 } from 'lucide-react'

export default function ReviewPlan({ lang, reviewData, medicines, setMedicines, setReviewData }) {
  const navigate = useNavigate()
  const [synced, setSynced] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [editingIdx, setEditingIdx] = useState(null)
  const [editForm, setEditForm] = useState(null)

  if (!reviewData) {
    return (
      <div className="h-full page-bg-center flex items-center justify-center">
        <p className="text-[15px] font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
          {t('scanPrescription', lang)}
        </p>
      </div>
    )
  }

  const { newMeds, duplicates } = reviewData

  const handleEdit = (idx) => {
    setEditingIdx(idx)
    setEditForm({ ...newMeds[idx] })
  }

  const handleSaveEdit = () => {
    if (editingIdx !== null && editForm) {
      const updated = [...newMeds]
      updated[editingIdx] = editForm
      onReview({ ...reviewData, newMeds: updated })
      setEditingIdx(null)
      setEditForm(null)
    }
  }

  const onReview = (data) => {
    // This is a local state update through the parent's setReviewData
    // We update reviewData directly since it's passed as prop
  }

  const handleConfirm = () => {
    const medsToAdd = newMeds.map(med => ({
      ...med,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    }))
    setMedicines(prev => [...prev, ...medsToAdd])
    setSynced(true)
  }

  const handleSync = () => {
    setTimeout(() => {
      setReviewData(null)
      navigate('/', { replace: true })
    }, 800)
  }

  const unitLabel = (unit, count) => {
    const num = parseInt(count) || 1
    const labels = {
      tablet: num > 1 ? (lang === 'zh' ? '片' : lang === 'ko' ? '정' : lang === 'ja' ? '錠' : 'tablets') : (lang === 'zh' ? '片' : lang === 'ko' ? '정' : lang === 'ja' ? '錠' : 'tablet'),
      capsule: num > 1 ? (lang === 'zh' ? '粒' : 'capsules') : (lang === 'zh' ? '粒' : 'capsule'),
      ml: 'ml',
      drop: num > 1 ? (lang === 'zh' ? '滴' : 'drops') : (lang === 'zh' ? '滴' : 'drop'),
      sachet: num > 1 ? (lang === 'zh' ? '包' : 'sachets') : (lang === 'zh' ? '包' : 'sachet'),
      patch: num > 1 ? (lang === 'zh' ? '贴' : 'patches') : (lang === 'zh' ? '贴' : 'patch'),
      puff: num > 1 ? (lang === 'zh' ? '喷' : 'puffs') : (lang === 'zh' ? '喷' : 'puff'),
    }
    return labels[unit] || labels.tablet
  }

  const freqLabel = (freq) => {
    const labels = {
      en: { once_daily: 'Once daily', twice_daily: 'Twice daily', three_times_daily: '3 times daily', four_times_daily: '4 times daily', every_8_hours: 'Every 8 hours', every_12_hours: 'Every 12 hours', weekly: 'Weekly', as_needed: 'As needed', daily: 'Daily' },
      zh: { once_daily: '每日一次', twice_daily: '每日两次', three_times_daily: '每日三次', four_times_daily: '每日四次', every_8_hours: '每8小时', every_12_hours: '每12小时', weekly: '每周', as_needed: '按需', daily: '每日' },
      ko: { once_daily: '하루 1회', twice_daily: '하루 2회', three_times_daily: '하루 3회', four_times_daily: '하루 4회', every_8_hours: '8시간마다', every_12_hours: '12시간마다', weekly: '매주', as_needed: '필요 시', daily: '매일' },
      ja: { once_daily: '1日1回', twice_daily: '1日2回', three_times_daily: '1日3回', four_times_daily: '1日4回', every_8_hours: '8時間ごと', every_12_hours: '12時間ごと', weekly: '毎週', as_needed: '必要時', daily: '毎日' },
    }
    const langLabels = labels[lang] || labels.en
    return langLabels[freq] || freq
  }

  if (synced) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(120,180,130,0.15) 0%, transparent 55%), rgb(var(--color-warm-cream))'
        }}>
        <div className="warm-orb warm-orb-sage absolute w-48 h-48" style={{ top: '20%', right: '-10%' }} />
        <div className="animate-fade-in-up relative z-10">
          <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 animate-glow"
            style={{ background: 'linear-gradient(150deg, rgba(120,180,130,0.2), rgba(120,180,130,0.05))' }}>
            <Check size={56} style={{ color: 'rgb(var(--color-success))' }} strokeWidth={1.3} />
          </div>
          <h1 className="text-[32px] font-bold mb-3" style={{
            fontFamily: 'Quicksand, sans-serif',
            color: 'rgb(var(--color-success))'
          }}>
            {t('syncComplete', lang)}
          </h1>
          <p className="text-[15px] font-medium mb-12" style={{ color: 'rgb(var(--color-text-light))' }}>
            {newMeds.length} {lang === 'zh' ? '种药物已添加' : lang === 'ko' ? '개 약물 추가됨' : lang === 'ja' ? '種類の薬を追加' : newMeds.length === 1 ? 'medication added' : 'medications added'}
          </p>
          <button onClick={handleSync} className="btn-primary px-16">
            {t('done', lang)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-bg min-h-full px-5 pb-10 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-sage absolute w-40 h-40" style={{ top: '-3%', right: '-12%' }} />
      <div className="warm-orb warm-orb-peach absolute w-32 h-32" style={{ top: '15%', left: '-10%' }} />

      {/* Header */}
      <div className="pt-10 pb-5 animate-fade-in-up relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/scan', { replace: true })}
            className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center">
            <ArrowLeft size={18} style={{ color: 'rgb(var(--color-text-light))' }} />
          </button>
          <div>
            <h1 className="text-[26px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              {t('reviewPlan', lang)}
            </h1>
            <p className="text-[13px] font-medium mt-0.5" style={{ color: 'rgb(var(--color-text-light))' }}>
              {newMeds.length > 0 
                ? (lang === 'zh' ? `识别到 ${newMeds.length} 种药物` : lang === 'ko' ? `${newMeds.length}개 약물 인식됨` : `${newMeds.length} medication${newMeds.length > 1 ? 's' : ''} found`)
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Safety banner */}
      <div className="card-glow p-5 mb-5 flex items-start gap-4 animate-fade-in-up stagger-1 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(92,140,126,0.1)' }}>
          <AlertTriangle size={17} className="text-primary" />
        </div>
        <div>
          <p className="text-[14px] leading-relaxed font-bold" style={{ color: 'rgb(var(--color-text))' }}>
            {t('reviewBeforeSync', lang)}
          </p>
          <p className="text-[12px] mt-1 font-medium leading-relaxed" style={{ color: 'rgb(var(--color-text-light))' }}>
            {lang === 'zh' ? 'AI 识别仅供参考，请仔细核对每一项，确保与您的处方一致。'
              : lang === 'ko' ? 'AI 인식은 참고용입니다. 각 항목을 처방전과 대조하여 확인해 주세요.'
              : lang === 'ja' ? 'AI認識は参考用です。各項目を処方箋と照合してください。'
              : 'AI recognition is for reference only. Please verify each item matches your prescription.'}
          </p>
        </div>
      </div>

      {/* Duplicate notification */}
      {duplicates.length > 0 && (
        <div className="glass-card p-5 mb-5 animate-slide-down overflow-hidden relative z-10"
          style={{ background: 'rgba(218,170,95,0.06)' }}>
          <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-[28px]"
            style={{ background: 'linear-gradient(90deg, rgb(var(--color-warning)), transparent)' }} />
          <div className="flex items-start gap-4 mt-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(218,170,95,0.1)' }}>
              <RefreshCw size={17} style={{ color: 'rgb(var(--color-warning))' }} />
            </div>
            <div>
              <p className="font-bold text-[15px]" style={{ color: 'rgb(var(--color-warning))' }}>
                {t('duplicateDetected', lang)}
              </p>
              <p className="text-[13px] mt-1 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                {t('notAddedAgain', lang)}
              </p>
              {duplicates.map((dup, i) => (
                <p key={i} className="text-[13px] font-bold mt-2" style={{ opacity: 0.6 }}>• {dup.name}</p>
              ))}
              <button onClick={() => setShowDuplicateModal(true)}
                className="mt-4 text-[13px] font-bold px-5 py-2.5 rounded-2xl glass-card flex items-center gap-2">
                <Eye size={14} /> {t('viewExisting', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New medicines cards */}
      {newMeds.length > 0 ? (
        <div className="space-y-4 mb-7 mt-3 relative z-10">
          {newMeds.map((med, i) => (
            <div key={i} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${0.08 * i}s`, opacity: 0 }}>
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-[18px] flex items-center justify-center flex-shrink-0"
                  style={{ 
                    width: 52, height: 52,
                    background: 'linear-gradient(145deg, rgba(92,140,126,0.1), rgba(200,220,208,0.15))' 
                  }}>
                  <Pill size={20} className="text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[17px] leading-tight">{med.name}</h3>
                    <button onClick={() => handleEdit(i)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(92,140,126,0.06)' }}>
                      <Edit3 size={14} className="text-primary" />
                    </button>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-[14px] gap-2">
                      <span className="font-semibold flex-shrink-0" style={{ color: 'rgb(var(--color-text-light))', minWidth: 50 }}>
                        {lang === 'zh' ? '剂量' : lang === 'ko' ? '용량' : lang === 'ja' ? '用量' : 'Dose'}
                      </span>
                      <span className="font-bold">
                        {med.dose} {unitLabel(med.unit, med.dose)}
                      </span>
                    </div>
                    <div className="flex items-center text-[14px] gap-2">
                      <span className="font-semibold flex-shrink-0" style={{ color: 'rgb(var(--color-text-light))', minWidth: 50 }}>
                        {lang === 'zh' ? '时间' : lang === 'ko' ? '시간' : lang === 'ja' ? '時間' : 'Time'}
                      </span>
                      <span className="font-bold">{(med.times || []).join(', ')}</span>
                    </div>
                    <div className="flex items-center text-[14px] gap-2">
                      <span className="font-semibold flex-shrink-0" style={{ color: 'rgb(var(--color-text-light))', minWidth: 50 }}>
                        {lang === 'zh' ? '频次' : lang === 'ko' ? '빈도' : lang === 'ja' ? '頻度' : 'Freq'}
                      </span>
                      <span className="font-bold">{freqLabel(med.frequency)}</span>
                    </div>
                    {med.note && (
                      <div className="flex items-start text-[14px] gap-2">
                        <span className="font-semibold flex-shrink-0" style={{ color: 'rgb(var(--color-text-light))', minWidth: 50 }}>
                          {lang === 'zh' ? '备注' : lang === 'ko' ? '메모' : lang === 'ja' ? '備考' : 'Note'}
                        </span>
                        <span className="font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>{med.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Original text from prescription */}
                  {med.originalText && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(92,140,126,0.08)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FileText size={12} style={{ color: 'rgb(var(--color-text-light))', opacity: 0.5 }} />
                        <span className="text-[11px] font-semibold" style={{ color: 'rgb(var(--color-text-light))', opacity: 0.5 }}>
                          {lang === 'zh' ? '原文' : lang === 'ko' ? '원문' : lang === 'ja' ? '原文' : 'Original text'}
                        </span>
                      </div>
                      <p className="text-[12px] font-medium italic leading-relaxed"
                        style={{ color: 'rgb(var(--color-text-light))', opacity: 0.6 }}>
                        "{med.originalText}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[14px] font-medium relative z-10"
          style={{ color: 'rgb(var(--color-text-light))' }}>
          {t('duplicateDetected', lang)}
        </div>
      )}

      {/* Actions */}
      {newMeds.length > 0 && (
        <div className="space-y-3.5 mb-10 animate-fade-in-up stagger-4 relative z-10">
          <button onClick={handleConfirm} className="btn-primary w-full text-center flex items-center justify-center gap-2.5">
            <Check size={19} />
            {t('confirmPlan', lang)}
          </button>
          <button onClick={() => navigate('/scan', { replace: true })} className="btn-soft w-full text-center">
            {t('cancel', lang)}
          </button>
        </div>
      )}

      {newMeds.length === 0 && (
        <button onClick={() => navigate('/', { replace: true })} className="btn-primary w-full text-center mb-10 relative z-10">
          {t('done', lang)}
        </button>
      )}

      {/* Edit modal */}
      {editingIdx !== null && editForm && (
        <div className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-t-[32px] p-7 animate-slide-up overflow-y-auto"
            style={{
              maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)',
              background: 'rgb(var(--color-warm-cream))'
            }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {lang === 'zh' ? '编辑药物' : lang === 'ko' ? '약물 편집' : 'Edit medication'}
              </h3>
              <button onClick={() => { setEditingIdx(null); setEditForm(null) }}
                className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
                <X size={17} style={{ color: 'rgb(var(--color-text-light))' }} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold mb-2 block" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {lang === 'zh' ? '药名' : lang === 'ko' ? '약물명' : 'Medicine name'}
                </label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full glass-card px-4 py-3.5 rounded-2xl text-[15px] font-bold outline-none"
                  style={{ background: 'rgba(255,255,255,0.5)' }} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[13px] font-semibold mb-2 block" style={{ color: 'rgb(var(--color-text-light))' }}>
                    {lang === 'zh' ? '剂量' : lang === 'ko' ? '용량' : 'Dose'}
                  </label>
                  <input value={editForm.dose} onChange={e => setEditForm({...editForm, dose: e.target.value})}
                    className="w-full glass-card px-4 py-3.5 rounded-2xl text-[15px] font-bold outline-none"
                    style={{ background: 'rgba(255,255,255,0.5)' }} />
                </div>
                <div className="flex-1">
                  <label className="text-[13px] font-semibold mb-2 block" style={{ color: 'rgb(var(--color-text-light))' }}>
                    {lang === 'zh' ? '单位' : lang === 'ko' ? '단위' : 'Unit'}
                  </label>
                  <select value={editForm.unit || 'tablet'} onChange={e => setEditForm({...editForm, unit: e.target.value})}
                    className="w-full glass-card px-4 py-3.5 rounded-2xl text-[15px] font-bold outline-none appearance-none"
                    style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <option value="tablet">{lang === 'zh' ? '片' : 'Tablet'}</option>
                    <option value="capsule">{lang === 'zh' ? '粒/胶囊' : 'Capsule'}</option>
                    <option value="ml">ml</option>
                    <option value="drop">{lang === 'zh' ? '滴' : 'Drop'}</option>
                    <option value="sachet">{lang === 'zh' ? '包' : 'Sachet'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold mb-2 block" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {lang === 'zh' ? '服用时间 (逗号分隔)' : lang === 'ko' ? '복용 시간 (쉼표로 구분)' : 'Times (comma separated)'}
                </label>
                <input value={(editForm.times || []).join(', ')} 
                  onChange={e => setEditForm({...editForm, times: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full glass-card px-4 py-3.5 rounded-2xl text-[15px] font-bold outline-none"
                  style={{ background: 'rgba(255,255,255,0.5)' }}
                  placeholder="08:00, 20:00" />
              </div>
              <div>
                <label className="text-[13px] font-semibold mb-2 block" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {lang === 'zh' ? '备注' : lang === 'ko' ? '메모' : 'Note'}
                </label>
                <input value={editForm.note || ''} onChange={e => setEditForm({...editForm, note: e.target.value})}
                  className="w-full glass-card px-4 py-3.5 rounded-2xl text-[15px] font-bold outline-none"
                  style={{ background: 'rgba(255,255,255,0.5)' }} />
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <button onClick={() => {
                const updated = [...reviewData.newMeds]
                updated[editingIdx] = editForm
                setReviewData({ ...reviewData, newMeds: updated })
                setEditingIdx(null)
                setEditForm(null)
              }} className="btn-primary w-full text-center">
                {lang === 'zh' ? '保存修改' : lang === 'ko' ? '변경 저장' : 'Save changes'}
              </button>
              <button onClick={() => { setEditingIdx(null); setEditForm(null) }} className="btn-soft w-full text-center">
                {t('cancel', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate detail modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-t-[32px] p-7 animate-slide-up overflow-y-auto"
            style={{
              maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)',
              background: 'rgb(var(--color-warm-cream))'
            }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {t('duplicateDetected', lang)}
              </h3>
              <button onClick={() => setShowDuplicateModal(false)}
                className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
                <X size={17} style={{ color: 'rgb(var(--color-text-light))' }} />
              </button>
            </div>
            <div className="space-y-3 mb-7">
              {duplicates.map((dup, i) => {
                const existing = medicines.find(m =>
                  m.name.toLowerCase() === dup.name.toLowerCase()
                )
                return (
                  <div key={i} className="glass-card p-6">
                    <p className="font-bold text-[16px]">{dup.name}</p>
                    <p className="text-[13px] mt-1.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                      {existing?.dose || dup.dose} {unitLabel(existing?.unit || dup.unit, existing?.dose || dup.dose)} · {(existing?.times || dup.times || []).join(', ')}
                    </p>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowDuplicateModal(false)} className="btn-soft w-full text-center">
              {t('close', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
