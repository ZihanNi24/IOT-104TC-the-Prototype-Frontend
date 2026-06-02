import { useState, useCallback, createContext, useContext } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { t, languages } from './i18n'
import LanguageSelect from './pages/LanguageSelect'
import RoleSelect from './pages/RoleSelect'
import WelcomePage from './pages/WelcomePage'
import PatientHome from './pages/PatientHome'
import PatientMedicines from './pages/PatientMedicines'
import CaregiverHome from './pages/CaregiverHome'
import MedicationPlan from './pages/MedicationPlan'
import ScanPrescription from './pages/ScanPrescription'
import ReviewPlan from './pages/ReviewPlan'
import HistoryAlerts from './pages/HistoryAlerts'
import SettingsPage from './pages/SettingsPage'
import ActiveReminder from './pages/ActiveReminder'
import { Home, Pill, ScanLine, ClipboardList, Clock, Settings, Heart } from 'lucide-react'

const AppContext = createContext()
export const useApp = () => useContext(AppContext)

function Toast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fixed top-[env(safe-area-inset-top,0px)] left-0 right-0 z-50 flex justify-center pt-4 px-5 animate-slide-down" onClick={onClose}>
      <div className="glass-hero px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg max-w-sm w-full"
        style={{ background: 'rgba(120,180,130,0.95)', backdropFilter: 'blur(20px)' }}>
        <span className="text-white text-[14px] font-bold">{message}</span>
      </div>
    </div>
  )
}

function TabBar({ role, lang }) {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const patientTabs = [
    { id: '/', icon: Home, label: t('home', lang) },
    { id: '/medicines', icon: Pill, label: t('myMedicines', lang) },
    { id: '/scan', icon: ScanLine, label: t('scan', lang) },
    { id: '/history', icon: Clock, label: t('history', lang) },
    { id: '/settings', icon: Settings, label: t('settings', lang) },
  ]

  const caregiverTabs = [
    { id: '/', icon: Heart, label: t('home', lang) },
    { id: '/plan', icon: ClipboardList, label: t('plan', lang) },
    { id: '/scan', icon: ScanLine, label: t('scan', lang) },
    { id: '/history', icon: Clock, label: t('history', lang) },
    { id: '/settings', icon: Settings, label: t('settings', lang) },
  ]

  const tabs = role === 'patient' ? patientTabs : caregiverTabs

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 tab-bar-glass"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-3 pt-2 pb-1.5">
        {tabs.map(tab => {
          const isActive = path === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="flex flex-col items-center gap-1 min-w-[52px] py-1.5 rounded-2xl transition-all relative"
            >
              {isActive && (
                <div className="absolute -top-1 w-6 h-1 rounded-full" 
                  style={{ background: 'linear-gradient(90deg, rgb(92,140,126), rgb(120,180,130))' }} />
              )}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isActive ? 'bg-primary/10' : ''
              }`}>
                <Icon size={21} strokeWidth={isActive ? 2.2 : 1.6} 
                  style={{ color: isActive ? 'rgb(92,140,126)' : 'rgb(180,175,168)' }} />
              </div>
              <span className={`text-[10px] leading-none ${
                isActive ? 'font-bold' : 'font-medium'
              }`} style={{ color: isActive ? 'rgb(92,140,126)' : 'rgb(180,175,168)' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AppRoutes() {
  const { 
    lang, role, setLang, setRole, 
    medicines, setMedicines, doseLog, setDoseLog, 
    reviewData, setReviewData, 
    patientContact, setPatientContact, 
    showToast, welcomed, setWelcomed, resetAll 
  } = useApp()

  if (!lang) return <LanguageSelect onSelect={setLang} />
  if (!role) return <RoleSelect lang={lang} onSelect={setRole} />
  if (!welcomed) return (
    <WelcomePage 
      lang={lang} 
      role={role} 
      onComplete={() => setWelcomed(true)} 
      setPatientContact={setPatientContact} 
    />
  )

  return (
    <div className="h-full flex flex-col" style={{ background: 'rgb(var(--color-bg))' }}>
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
        <Routes>
          <Route path="/" element={
            role === 'patient'
              ? <PatientHome lang={lang} medicines={medicines} doseLog={doseLog} setDoseLog={setDoseLog} />
              : <CaregiverHome lang={lang} medicines={medicines} doseLog={doseLog} setDoseLog={setDoseLog} patientContact={patientContact} showToast={showToast} />
          } />
          <Route path="/medicines" element={
            <PatientMedicines lang={lang} medicines={medicines} setMedicines={setMedicines} />
          } />
          <Route path="/plan" element={
            <MedicationPlan lang={lang} medicines={medicines} setMedicines={setMedicines} />
          } />
          <Route path="/scan" element={
            <ScanPrescription lang={lang} role={role} onReview={setReviewData} medicines={medicines} />
          } />
          <Route path="/review" element={
            <ReviewPlan lang={lang} reviewData={reviewData} medicines={medicines} setMedicines={setMedicines} setReviewData={setReviewData} />
          } />
          <Route path="/history" element={
            <HistoryAlerts lang={lang} doseLog={doseLog} medicines={medicines} patientContact={patientContact} showToast={showToast} />
          } />
          <Route path="/reminder" element={
            <ActiveReminder lang={lang} medicines={medicines} doseLog={doseLog} setDoseLog={setDoseLog} />
          } />
          <Route path="/settings" element={
            <SettingsPage lang={lang} role={role} setLang={setLang} setRole={setRole} patientContact={patientContact} setPatientContact={setPatientContact} resetAll={resetAll} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TabBar role={role} lang={lang} />
    </div>
  )
}

const STORAGE_KEY = 'medibox_state'

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return s || {}
  } catch { return {} }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export default function App() {
  const saved = loadState()
  const [lang, setLangState] = useState(saved.lang || null)
  const [role, setRoleState] = useState(saved.role || null)
  const [welcomed, setWelcomedState] = useState(saved.welcomed || false)
  const [medicines, setMedicinesState] = useState(saved.medicines || [])
  const [doseLog, setDoseLogState] = useState(saved.doseLog || [])
  const [reviewData, setReviewData] = useState(null)
  const [patientContact, setPatientContactState] = useState(saved.patientContact || { name: '', phone: '' })
  const [toastMsg, setToastMsg] = useState(null)
  // key forces full re-render on lang change to avoid stale translated strings
  const [renderKey, setRenderKey] = useState(0)

  const setLang = useCallback((l) => { 
    setLangState(l)
    saveState({ ...loadState(), lang: l })
    // Force full re-render so all translated strings update immediately
    setRenderKey(k => k + 1)
  }, [])
  
  const setRole = useCallback((r) => { 
    setRoleState(r)
    saveState({ ...loadState(), role: r }) 
  }, [])
  
  const setWelcomed = useCallback((w) => {
    setWelcomedState(w)
    saveState({ ...loadState(), welcomed: w })
  }, [])
  
  const setMedicines = useCallback((m) => {
    const val = typeof m === 'function' ? m(loadState().medicines || []) : m
    setMedicinesState(val)
    saveState({ ...loadState(), medicines: val })
  }, [])
  
  const setDoseLog = useCallback((d) => {
    const val = typeof d === 'function' ? d(loadState().doseLog || []) : d
    setDoseLogState(val)
    saveState({ ...loadState(), doseLog: val })
  }, [])
  
  const setPatientContact = useCallback((c) => {
    const val = typeof c === 'function' ? c(loadState().patientContact || { name: '', phone: '' }) : c
    setPatientContactState(val)
    saveState({ ...loadState(), patientContact: val })
  }, [])
  
  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }, [])

  const resetAll = useCallback(() => {
    setLangState(null)
    setRoleState(null)
    setWelcomedState(false)
    setPatientContactState({ name: '', phone: '' })
    saveState({ medicines: loadState().medicines || [], doseLog: loadState().doseLog || [] })
    setRenderKey(k => k + 1)
  }, [])

  return (
    <AppContext.Provider key={renderKey} value={{ 
      lang, role, setLang, setRole, 
      medicines, setMedicines, doseLog, setDoseLog, 
      reviewData, setReviewData, 
      patientContact, setPatientContact, 
      showToast, welcomed, setWelcomed, resetAll 
    }}>
      <HashRouter>
        <AppRoutes />
        <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
      </HashRouter>
    </AppContext.Provider>
  )
}
