import { useState } from 'react'
import { t, languages } from '../i18n'
import { Globe, Users, ChevronRight, Info, X, Phone, User, Check, Heart, LogOut } from 'lucide-react'

export default function SettingsPage({ lang, role, setLang, setRole, patientContact, setPatientContact, resetAll }) {
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showContactEditor, setShowContactEditor] = useState(false)
  const [editName, setEditName] = useState(patientContact?.name || '')
  const [editPhone, setEditPhone] = useState(patientContact?.phone || '')
  const [saved, setSaved] = useState(false)

  const currentLang = languages.find(l => l.code === lang)

  const handleSaveContact = () => {
    setPatientContact({ name: editName.trim(), phone: editPhone.trim() })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowContactEditor(false)
    }, 1200)
  }

  const openContactEditor = () => {
    setEditName(patientContact?.name || '')
    setEditPhone(patientContact?.phone || '')
    setSaved(false)
    setShowContactEditor(true)
  }

  const handleLangChange = (code) => {
    setShowLangPicker(false)
    // Small delay to let modal close animation finish before triggering re-render
    setTimeout(() => {
      setLang(code)
    }, 50)
  }

  return (
    <div className="page-bg min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-peach absolute w-40 h-40" style={{ top: '-3%', right: '-12%' }} />
      <div className="warm-orb warm-orb-lavender absolute w-32 h-32" style={{ top: '20%', left: '-8%' }} />

      {/* Header */}
      <div className="pt-10 pb-6 animate-fade-in-up relative z-10">
        <span className="text-3xl">⚙️</span>
        <h1 className="text-[28px] font-bold mt-3" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          {t('settings', lang)}
        </h1>
      </div>

      <div className="space-y-3.5 mt-2 relative z-10">
        {/* Patient Contact — only for caregiver */}
        {role === 'caregiver' && (
          <button
            onClick={openContactEditor}
            className="w-full glass-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all animate-fade-in-up"
          >
            <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, rgba(200,130,130,0.08), rgba(240,200,200,0.12))' }}>
              <Heart size={20} style={{ color: 'rgb(var(--color-danger))' }} strokeWidth={1.6} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-[16px]">{t('patientContact', lang)}</p>
              {patientContact?.phone ? (
                <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {patientContact.name ? `${patientContact.name} · ` : ''}{patientContact.phone}
                </p>
              ) : (
                <p className="text-[12px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-warning))' }}>
                  {t('enterPhone', lang)}
                </p>
              )}
            </div>
            <ChevronRight size={18} style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }} />
          </button>
        )}

        {/* Language */}
        <button
          onClick={() => setShowLangPicker(true)}
          className="w-full glass-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all animate-fade-in-up stagger-1"
        >
          <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(92,140,126,0.1), rgba(200,220,208,0.12))' }}>
            <Globe size={20} className="text-primary" strokeWidth={1.6} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-[16px]">{t('language', lang)}</p>
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
              {currentLang?.native}
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }} />
        </button>

        {/* Role */}
        <button
          onClick={() => setShowRolePicker(true)}
          className="w-full glass-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all animate-fade-in-up stagger-2"
        >
          <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(186,146,112,0.1), rgba(248,232,218,0.15))' }}>
            <Users size={20} className="text-secondary" strokeWidth={1.6} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-[16px]">{t('switchRole', lang)}</p>
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
              {role === 'patient' ? t('patient', lang) : t('caregiver', lang)}
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }} />
        </button>

        {/* About */}
        <div className="glass-card p-5 flex items-center gap-4 animate-fade-in-up stagger-3">
          <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.03)' }}>
            <Info size={20} style={{ color: 'rgb(var(--color-text-light))' }} strokeWidth={1.6} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-[16px]">{t('about', lang)}</p>
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
              MediBox Companion v1.0
            </p>
          </div>
        </div>

        {/* Logout / Switch User */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full glass-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all animate-fade-in-up stagger-3 mt-4"
          style={{ borderColor: 'rgba(220,120,100,0.15)' }}
        >
          <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(220,120,100,0.08), rgba(250,200,190,0.12))' }}>
            <LogOut size={20} style={{ color: 'rgb(var(--color-danger))' }} strokeWidth={1.6} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-[16px]" style={{ color: 'rgb(var(--color-danger))' }}>{t('logout', lang)}</p>
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('logoutDesc', lang)}
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'rgb(var(--color-text-light))', opacity: 0.4 }} />
        </button>
      </div>

      {/* Contact editor modal */}
      {showContactEditor && (
        <div className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-t-[32px] p-7 overflow-y-auto animate-slide-up"
            style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)', background: 'rgb(var(--color-warm-cream))' }}>
            
            {saved ? (
              <div className="py-12 flex flex-col items-center animate-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ background: 'rgba(120,180,130,0.1)' }}>
                  <Check size={36} style={{ color: 'rgb(var(--color-success))' }} strokeWidth={1.5} />
                </div>
                <p className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: 'rgb(var(--color-success))' }}>
                  {t('contactSaved', lang)}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-7">
                  <h3 className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    {t('patientContact', lang)}
                  </h3>
                  <button onClick={() => setShowContactEditor(false)}
                    className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
                    <X size={17} style={{ color: 'rgb(var(--color-text-light))' }} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[13px] font-semibold mb-2.5 flex items-center gap-2"
                      style={{ color: 'rgb(var(--color-text-light))' }}>
                      <User size={14} />
                      {t('contactName', lang)}
                    </label>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder={lang === 'zh' ? '例如：妈妈、爸爸、王奶奶' : 'e.g. Mom, Dad, Grandma'}
                      className="w-full glass-card px-5 py-4 rounded-2xl text-[16px] font-bold outline-none"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold mb-2.5 flex items-center gap-2"
                      style={{ color: 'rgb(var(--color-text-light))' }}>
                      <Phone size={14} />
                      {t('contactPhone', lang)}
                    </label>
                    <input
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      type="tel"
                      placeholder={lang === 'zh' ? '例如：13800138000' : 'e.g. +1 555 123 4567'}
                      className="w-full glass-card px-5 py-4 rounded-2xl text-[16px] font-bold outline-none"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                      inputMode="tel"
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button onClick={handleSaveContact}
                    disabled={!editPhone.trim()}
                    className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-40 disabled:scale-100">
                    <Check size={18} />
                    {t('save', lang)}
                  </button>
                  <button onClick={() => setShowContactEditor(false)} className="btn-soft w-full text-center">
                    {t('cancel', lang)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Language picker modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-t-[32px] p-7 overflow-y-auto animate-slide-up"
            style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)', background: 'rgb(var(--color-warm-cream))' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {t('selectLanguage', lang)}
              </h3>
              <button onClick={() => setShowLangPicker(false)}
                className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
                <X size={17} style={{ color: 'rgb(var(--color-text-light))' }} />
              </button>
            </div>
            <div className="space-y-2">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    lang === l.code ? 'glass-card' : 'active:bg-black/3'
                  }`}
                  style={lang === l.code ? { background: 'rgba(92,140,126,0.08)', borderColor: 'rgba(92,140,126,0.15)' } : {}}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(92,140,126,0.06)' }}>
                    <span className="text-[10px] font-extrabold uppercase text-primary tracking-wide">{l.code}</span>
                  </div>
                  <span className="font-bold text-[15px]">{l.native}</span>
                  {lang === l.code && <span className="ml-auto text-primary font-bold text-sm">✓</span>}
                </button>
              ))}
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.25)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false) }}>
          <div className="w-full max-w-sm rounded-[32px] p-7 animate-fade-in-up"
            style={{ background: 'rgb(var(--color-warm-cream))' }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(220,120,100,0.08)' }}>
                <LogOut size={28} style={{ color: 'rgb(var(--color-danger))' }} strokeWidth={1.5} />
              </div>
              <h3 className="text-[20px] font-bold mb-3" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {t('logout', lang)}
              </h3>
              <p className="text-[14px] font-medium leading-relaxed mb-7"
                style={{ color: 'rgb(var(--color-text-light))' }}>
                {t('logoutConfirm', lang)}
              </p>
              <div className="w-full space-y-3">
                <button
                  onClick={() => { setShowLogoutConfirm(false); resetAll(); }}
                  className="w-full py-4 rounded-2xl text-[16px] font-bold text-white active:scale-[0.97] transition-all"
                  style={{ background: 'linear-gradient(145deg, rgb(220,120,100), rgb(200,100,80))' }}>
                  {t('logoutBtn', lang)}
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn-soft w-full text-center">
                  {t('cancel', lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role picker modal — uses full viewport height so it's never behind tab bar */}
      {showRolePicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{ height: 'var(--visual-height, 100dvh)', background: 'rgba(50,45,40,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRolePicker(false) }}>
          <div className="w-full max-w-sm rounded-[32px] p-7 animate-fade-in-up"
            style={{ background: 'rgb(var(--color-warm-cream))' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {t('switchRole', lang)}
              </h3>
              <button onClick={() => setShowRolePicker(false)}
                className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
                <X size={17} style={{ color: 'rgb(var(--color-text-light))' }} />
              </button>
            </div>
            <div className="space-y-3.5">
              <button
                onClick={() => { setRole('patient'); setShowRolePicker(false) }}
                className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all ${
                  role === 'patient' ? 'glass-card' : 'active:bg-black/3'
                }`}
                style={role === 'patient' ? { background: 'rgba(92,140,126,0.08)', borderColor: 'rgba(92,140,126,0.15)' } : {}}
              >
                <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(150deg, rgba(200,220,208,0.5), rgba(92,140,126,0.1))' }}>
                  <User size={20} className="text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[16px]">{t('patient', lang)}</p>
                  <p className="text-[13px] mt-1 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                    {t('patientDesc', lang)}
                  </p>
                </div>
                {role === 'patient' && <Check size={18} className="text-primary" strokeWidth={2.5} />}
              </button>
              <button
                onClick={() => { setRole('caregiver'); setShowRolePicker(false) }}
                className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all ${
                  role === 'caregiver' ? 'glass-card' : 'active:bg-black/3'
                }`}
                style={role === 'caregiver' ? { background: 'rgba(92,140,126,0.08)', borderColor: 'rgba(92,140,126,0.15)' } : {}}
              >
                <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(150deg, rgba(248,232,218,0.6), rgba(186,146,112,0.1))' }}>
                  <Heart size={20} className="text-secondary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[16px]">{t('caregiver', lang)}</p>
                  <p className="text-[13px] mt-1 font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                    {t('caregiverDesc', lang)}
                  </p>
                </div>
                {role === 'caregiver' && <Check size={18} className="text-primary" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
