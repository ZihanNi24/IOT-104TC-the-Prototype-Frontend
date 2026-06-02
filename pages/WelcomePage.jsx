import { useState } from 'react'
import { t } from '../i18n'
import { Sparkles, Phone, ArrowRight, Heart, Shield, Check, X } from 'lucide-react'

const welcomeTexts = {
  en: {
    title: 'Welcome to MediBox',
    subtitle: 'Your medication companion',
    features: [
      { icon: '💊', text: 'Smart reminders when it\'s time to take medicine' },
      { icon: '📋', text: 'Scan prescriptions and create plans automatically' },
      { icon: '📱', text: 'Sync with your smart pill box' },
    ],
    careFeatures: [
      { icon: '👁️', text: 'Monitor medication status in real time' },
      { icon: '📞', text: 'Call or send reminders when doses are missed' },
      { icon: '📋', text: 'Scan and manage prescriptions for your loved one' },
    ],
    setupPhone: 'Set up contact number',
    setupPhoneDesc: 'Enable quick call and reminder features',
    phonePlaceholder: 'Phone number',
    namePlaceholder: 'Name (e.g. Mom, Dad)',
    skipForNow: 'Set up later',
    getStarted: 'Get Started',
    patientGreeting: 'We\'re here to help you never miss a dose.',
    caregiverGreeting: 'We\'ll help you keep your loved one safe.',
  },
  zh: {
    title: '欢迎来到 MediBox',
    subtitle: '您的智能服药助手',
    features: [
      { icon: '💊', text: '到点智能提醒，不再忘记吃药' },
      { icon: '📋', text: '扫描医嘱自动生成服药计划' },
      { icon: '📱', text: '与智能药盒无缝同步' },
    ],
    careFeatures: [
      { icon: '👁️', text: '实时掌握服药情况' },
      { icon: '📞', text: '漏服时快速拨打电话或发送提醒' },
      { icon: '📋', text: '帮助扫描和管理医嘱' },
    ],
    setupPhone: '设置联系电话',
    setupPhoneDesc: '开启快速拨打和提醒功能',
    phonePlaceholder: '电话号码',
    namePlaceholder: '称呼（如妈妈、爸爸）',
    skipForNow: '稍后设置',
    getStarted: '开始使用',
    patientGreeting: '我们帮你按时吃药，从不遗漏。',
    caregiverGreeting: '我们帮你守护家人的健康。',
  },
  ko: {
    title: 'MediBox에 오신 것을 환영합니다',
    subtitle: '스마트 복약 도우미',
    features: [
      { icon: '💊', text: '복약 시간에 맞춰 스마트 알림을 보내드려요' },
      { icon: '📋', text: '처방전을 스캔하면 자동으로 계획이 생성돼요' },
      { icon: '📱', text: '스마트 약통과 자동 동기화돼요' },
    ],
    careFeatures: [
      { icon: '👁️', text: '실시간으로 복약 상태를 확인하세요' },
      { icon: '📞', text: '복약 누락 시 전화하거나 알림을 보내세요' },
      { icon: '📋', text: '처방전을 스캔하고 관리하세요' },
    ],
    setupPhone: '연락처 설정',
    setupPhoneDesc: '빠른 전화 및 알림 기능을 활성화하세요',
    phonePlaceholder: '전화번호',
    namePlaceholder: '이름 (예: 어머니, 아버지)',
    skipForNow: '나중에 설정',
    getStarted: '시작하기',
    patientGreeting: '한 번도 복약을 놓치지 않도록 도와드릴게요.',
    caregiverGreeting: '소중한 분의 건강을 함께 지켜드릴게요.',
  },
  ja: {
    title: 'MediBoxへようこそ',
    subtitle: 'あなたのお薬パートナー',
    features: [
      { icon: '💊', text: 'お薬の時間をスマートにお知らせします' },
      { icon: '📋', text: '処方箋をスキャンして自動でプランを作成' },
      { icon: '📱', text: 'スマートお薬ケースと自動同期' },
    ],
    careFeatures: [
      { icon: '👁️', text: 'リアルタイムで服薬状況を確認' },
      { icon: '📞', text: '飲み忘れ時に電話やリマインドを送信' },
      { icon: '📋', text: '処方箋のスキャンと管理をサポート' },
    ],
    setupPhone: '連絡先を設定',
    setupPhoneDesc: 'ワンタッチ通話・リマインド機能を有効にします',
    phonePlaceholder: '電話番号',
    namePlaceholder: 'お名前（例：お母さん、お父さん）',
    skipForNow: '後で設定',
    getStarted: 'はじめる',
    patientGreeting: '大切なお薬を忘れないようお手伝いします。',
    caregiverGreeting: '大切な方の健康をサポートします。',
  },
}

function getTexts(lang) {
  return welcomeTexts[lang] || welcomeTexts.en
}

export default function WelcomePage({ lang, role, onComplete, setPatientContact }) {
  const [step, setStep] = useState('welcome') // 'welcome' | 'phone'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const texts = getTexts(lang)
  const features = role === 'caregiver' ? texts.careFeatures : texts.features

  const handleSaveAndStart = () => {
    if (phone.trim()) {
      setPatientContact({ name: name.trim(), phone: phone.trim() })
    }
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  if (step === 'phone') {
    return (
      <div className="h-full page-bg-warm flex flex-col px-6 relative overflow-y-auto no-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]" />
        
        <div className="warm-orb warm-orb-peach absolute w-44 h-44" style={{ top: '3%', right: '-12%' }} />
        <div className="warm-orb warm-orb-sage absolute w-36 h-36" style={{ bottom: '20%', left: '-8%' }} />

        <div className="flex-shrink-0" style={{ height: '12vh' }} />

        <div className="relative z-10 animate-fade-in-up">
          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'linear-gradient(150deg, rgba(248,232,218,0.5), rgba(186,146,112,0.15))' }}>
            <Phone size={28} className="text-secondary" strokeWidth={1.4} />
          </div>

          <h2 className="text-[26px] font-bold text-center mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {texts.setupPhone}
          </h2>
          <p className="text-[14px] text-center mb-10 leading-relaxed" style={{ color: 'rgb(var(--color-text-light))' }}>
            {texts.setupPhoneDesc}
          </p>

          <div className="space-y-4 max-w-sm mx-auto">
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={texts.namePlaceholder}
                className="w-full glass-hero px-5 py-4.5 rounded-2xl text-[16px] font-semibold outline-none"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              />
            </div>
            <div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                placeholder={texts.phonePlaceholder}
                className="w-full glass-hero px-5 py-4.5 rounded-2xl text-[16px] font-semibold outline-none"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              />
            </div>

            <div className="glass-card p-4 flex items-start gap-3 mt-2"
              style={{ background: 'rgba(92,140,126,0.04)' }}>
              <Shield size={15} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[12px] font-medium leading-relaxed" style={{ color: 'rgb(var(--color-text-light))' }}>
                {lang === 'zh' ? '号码仅用于拨打电话和发送提醒短信，不会用于其他用途。' 
                  : lang === 'ko' ? '전화번호는 전화 걸기와 알림 전송에만 사용됩니다.'
                  : lang === 'ja' ? '電話番号は通話とリマインダー送信にのみ使用されます。'
                  : 'Your number is only used for making calls and sending reminder messages.'}
              </p>
            </div>
          </div>

          <div className="mt-10 max-w-sm mx-auto space-y-3">
            <button onClick={handleSaveAndStart}
              disabled={!phone.trim()}
              className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-40">
              <Check size={18} />
              {texts.getStarted}
            </button>
            <button onClick={handleSkip}
              className="btn-soft w-full text-center">
              {texts.skipForNow}
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 h-16" />
      </div>
    )
  }

  return (
    <div className="h-full page-bg-warm flex flex-col px-6 relative overflow-y-auto no-scrollbar">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-peach absolute w-52 h-52" style={{ top: '2%', right: '-18%' }} />
      <div className="warm-orb warm-orb-sage absolute w-40 h-40" style={{ top: '30%', left: '-12%' }} />
      <div className="warm-orb warm-orb-lavender absolute w-32 h-32" style={{ bottom: '18%', right: '5%' }} />

      <div className="flex-shrink-0" style={{ height: '12vh' }} />

      <div className="relative z-10 animate-fade-in-up text-center">
        <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 mx-auto glass-hero animate-float"
          style={{ background: 'linear-gradient(160deg, rgba(200,220,208,0.5), rgba(248,232,218,0.3), rgba(222,216,235,0.2))' }}>
          <Sparkles size={36} className="text-primary" strokeWidth={1.3} />
        </div>

        <h1 className="text-[30px] font-bold leading-tight mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          {texts.title}
        </h1>
        <p className="text-[14px] font-medium mb-3" style={{ color: 'rgb(var(--color-text-light))' }}>
          {texts.subtitle}
        </p>
        <p className="text-[15px] font-semibold mb-10 leading-relaxed max-w-[280px] mx-auto"
          style={{ color: 'rgb(var(--color-primary))' }}>
          {role === 'caregiver' ? texts.caregiverGreeting : texts.patientGreeting}
        </p>
      </div>

      <div className="relative z-10 space-y-4 max-w-sm mx-auto w-full">
        {features.map((f, i) => (
          <div key={i}
            className="glass-card p-5 flex items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: `${0.1 + i * 0.1}s`, opacity: 0 }}>
            <span className="text-2xl flex-shrink-0">{f.icon}</span>
            <p className="text-[14px] font-semibold leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-10 max-w-sm mx-auto w-full">
        {role === 'caregiver' ? (
          <button onClick={() => setStep('phone')}
            className="btn-primary w-full text-center flex items-center justify-center gap-2">
            <Phone size={18} />
            {texts.setupPhone}
            <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleSkip}
            className="btn-primary w-full text-center flex items-center justify-center gap-2">
            {texts.getStarted}
            <ArrowRight size={16} />
          </button>
        )}
        
        {role === 'caregiver' && (
          <button onClick={handleSkip}
            className="btn-soft w-full text-center mt-3">
            {texts.skipForNow}
          </button>
        )}
      </div>

      <div className="flex-shrink-0 h-20" />
    </div>
  )
}
