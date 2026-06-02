import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import { t } from '../i18n'

const AppContext = createContext(null)

const DEFAULT_MEDICINES = [
  {
    id: 'med-1',
    name: 'Metformin',
    dose: 2,
    times: ['08:00'],
    frequency: 'daily',
    note: 'afterBreakfast',
    synced: true,
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    dose: 1,
    times: ['08:00', '20:00'],
    frequency: 'twiceDaily',
    note: 'afterBreakfast',
    synced: true,
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    dose: 1,
    times: ['21:00'],
    frequency: 'daily',
    note: 'beforeBed',
    synced: true,
  },
]

function generateScheduleFromMedicines(medicines) {
  const schedule = []
  medicines.forEach(med => {
    med.times.forEach(time => {
      schedule.push({
        id: `${med.id}-${time}`,
        medicineId: med.id,
        medicineName: med.name,
        dose: med.dose,
        time,
        note: med.note,
        status: 'upcoming',
      })
    })
  })
  return schedule.sort((a, b) => a.time.localeCompare(b.time))
}

function getTimeCategory(time) {
  const hour = parseInt(time.split(':')[0])
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'night'
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('medinest-lang') || '')
  const [role, setRoleState] = useState(() => localStorage.getItem('medinest-role') || '')
  const [medicines, setMedicines] = useState(DEFAULT_MEDICINES)
  const [todaySchedule, setTodaySchedule] = useState([])
  const [historyRecords, setHistoryRecords] = useState([])
  const [deviceStatus, setDeviceStatus] = useState('online')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const sched = generateScheduleFromMedicines(medicines)
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const updated = sched.map(item => {
      const existing = todaySchedule.find(s => s.id === item.id)
      if (existing && (existing.status === 'completed' || existing.status === 'missed' || existing.status === 'skipped')) {
        return { ...item, status: existing.status }
      }
      if (item.time < currentTime) {
        return { ...item, status: 'missed' }
      }
      const timeDiff = timeToMinutes(item.time) - timeToMinutes(currentTime)
      if (timeDiff <= 30 && timeDiff >= 0) {
        return { ...item, status: 'active' }
      }
      return item
    })
    setTodaySchedule(updated)
  }, [medicines])

  async function loadData() {
    try {
      const savedMeds = await db.get('app-data', 'medicines')
      if (savedMeds?.items) {
        setMedicines(savedMeds.items)
      }
      const savedHistory = await db.get('app-data', 'med-history')
      if (savedHistory?.records) {
        setHistoryRecords(savedHistory.records)
      }
    } catch (e) {
      // use defaults
    }
    setLoading(false)
  }

  async function saveMedicines(meds) {
    setMedicines(meds)
    await db.upsert('app-data', { items: meds }, 'medicines')
  }

  async function saveHistory(records) {
    setHistoryRecords(records)
    await db.upsert('app-data', { records }, 'med-history')
  }

  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const setLang = useCallback((l) => {
    setLangState(l)
    localStorage.setItem('medinest-lang', l)
  }, [])

  const setRole = useCallback((r) => {
    setRoleState(r)
    localStorage.setItem('medinest-role', r)
  }, [])

  const markDose = useCallback((scheduleId, status) => {
    setTodaySchedule(prev => {
      const updated = prev.map(s => s.id === scheduleId ? { ...s, status } : s)
      return updated
    })
    const record = {
      id: `${scheduleId}-${Date.now()}`,
      scheduleId,
      status,
      timestamp: new Date().toISOString(),
    }
    const newHistory = [record, ...historyRecords].slice(0, 100)
    saveHistory(newHistory)
  }, [historyRecords])

  const addMedicine = useCallback(async (med) => {
    const existing = medicines.find(m => 
      m.name.toLowerCase() === med.name.toLowerCase() && 
      m.dose === med.dose && 
      JSON.stringify(m.times.sort()) === JSON.stringify(med.times.sort())
    )
    if (existing) {
      return { duplicate: true, existing }
    }
    const newMed = { ...med, id: `med-${Date.now()}`, synced: false }
    const updated = [...medicines, newMed]
    await saveMedicines(updated)
    return { duplicate: false, medicine: newMed }
  }, [medicines])

  const updateMedicine = useCallback(async (id, updates) => {
    const updated = medicines.map(m => m.id === id ? { ...m, ...updates, synced: false } : m)
    await saveMedicines(updated)
  }, [medicines])

  const removeMedicine = useCallback(async (id) => {
    const updated = medicines.filter(m => m.id !== id)
    await saveMedicines(updated)
  }, [medicines])

  const syncAllMedicines = useCallback(async () => {
    const updated = medicines.map(m => ({ ...m, synced: true }))
    await saveMedicines(updated)
  }, [medicines])

  const completedCount = todaySchedule.filter(s => s.status === 'completed').length
  const missedCount = todaySchedule.filter(s => s.status === 'missed').length
  const totalDoses = todaySchedule.length
  const nextDose = todaySchedule.find(s => s.status === 'upcoming' || s.status === 'active')
  const activeDose = todaySchedule.find(s => s.status === 'active')

  const groupedSchedule = {
    morning: todaySchedule.filter(s => getTimeCategory(s.time) === 'morning'),
    afternoon: todaySchedule.filter(s => getTimeCategory(s.time) === 'afternoon'),
    night: todaySchedule.filter(s => getTimeCategory(s.time) === 'night'),
  }

  const alerts = []
  if (missedCount > 0) alerts.push({ type: 'missedDose', count: missedCount })
  if (deviceStatus === 'offline') alerts.push({ type: 'deviceOffline' })
  const unsyncedCount = medicines.filter(m => !m.synced).length
  if (unsyncedCount > 0) alerts.push({ type: 'scheduleNotSynced', count: unsyncedCount })

  const value = {
    lang, setLang,
    role, setRole,
    medicines, addMedicine, updateMedicine, removeMedicine, syncAllMedicines,
    todaySchedule, groupedSchedule,
    completedCount, missedCount, totalDoses, nextDose, activeDose,
    markDose,
    historyRecords,
    deviceStatus,
    alerts,
    loading,
    t: (key, params) => t(key, lang || 'en', params),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
