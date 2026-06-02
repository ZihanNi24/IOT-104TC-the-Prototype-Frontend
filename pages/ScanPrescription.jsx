import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { Camera, Upload, Loader2, AlertTriangle, ScanLine, ImagePlus, RotateCcw, ZoomIn } from 'lucide-react'
import { storage } from '../lib/storage'
import { ai } from '../lib/ai'

const SCAN_PROMPT = `You are a world-class prescription and medication label reader with expertise in pharmacy documents from ALL countries and ALL languages.

TASK: Carefully analyze this image and extract EVERY medication mentioned. The image may be:
- A printed hospital/clinic prescription (any country, any language)
- A handwritten doctor's note
- A medication package or label
- A pharmacy receipt / dispensing label
- A screenshot of a digital prescription
- A photo of pills with labels
- A blister pack with printed info

EXTRACTION RULES:
1. Read ALL text in the image first, even if blurry or partially visible
2. Identify medication names (brand names AND generic names)
3. Extract dosage amounts (mg, ml, tablets, capsules, etc.)
4. Extract timing/frequency (how many times per day, specific times if given)
5. Extract any instructions (before/after meals, with water, before bed, etc.)
6. If the prescription is in ANY language (Chinese, Korean, Japanese, Arabic, Spanish, French, German, etc.), still extract and translate medicine names to their international/English equivalent where possible, but keep the original name too
7. If handwriting is hard to read, make your BEST interpretation and include it
8. If a dosage is written as "1x3" or "1 tablet 3 times daily" or "一日三次" etc., interpret it correctly
9. For timing, convert vague instructions to specific times: morning≈08:00, noon/lunch≈12:00, afternoon≈14:00, evening/dinner≈18:00, night/bedtime≈22:00

IMPORTANT: Be AGGRESSIVE in finding medications. Even if the image is slightly blurry, tilted, or has shadows — try your best. Only return empty array if the image truly contains NO medication information at all.

RESPONSE FORMAT — Return ONLY a valid JSON array, absolutely no prose, no explanation, no code fence:
[
  {
    "name": "Medicine Name (Original Language Name if non-English)",
    "dose": "2",
    "unit": "tablet",
    "times": ["08:00", "20:00"],
    "note": "After meals, with warm water",
    "frequency": "twice_daily",
    "originalText": "the exact text you read from the image for this medicine"
  }
]

Fields:
- name: medicine name, include both original and English if non-English prescription
- dose: number per single intake (just the number as string)
- unit: "tablet" | "capsule" | "ml" | "drop" | "sachet" | "patch" | "puff"
- times: array of HH:MM in 24h format
- note: any special instructions
- frequency: "once_daily" | "twice_daily" | "three_times_daily" | "four_times_daily" | "every_8_hours" | "every_12_hours" | "weekly" | "as_needed"
- originalText: the raw text you extracted for this entry (helps user verify)

If you can identify medicines but cannot determine exact dosage or timing, STILL include them with your best guess and mark the note as "Please verify dosage" or "Please verify timing".

NEVER return an empty array if there is ANY medication-related text visible. Try harder.`

export default function ScanPrescription({ lang, role, onReview, medicines }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const fileRef = useRef(null)
  const cameraRef = useRef(null)

  const processImage = async (imageUrl) => {
    setLoading(true)
    setError(null)

    try {
      // First attempt with the enhanced prompt
      const { text } = await ai.run(SCAN_PROMPT, { images: [imageUrl] })

      let parsed = []
      try {
        // Clean up any potential formatting issues
        let cleaned = text
        // Remove code fences if present
        cleaned = cleaned.replace(/```json?\s*/gi, '').replace(/```/g, '')
        // Remove any leading/trailing prose
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          cleaned = jsonMatch[0]
        }
        cleaned = cleaned.trim()
        parsed = JSON.parse(cleaned)
      } catch {
        // If JSON parse fails, try a second pass asking AI to fix it
        try {
          const { text: fixed } = await ai.run(
            `The following text was supposed to be a JSON array of medications but has formatting issues. Fix it and return ONLY a valid JSON array, nothing else:\n\n${text}`,
          )
          const fixedCleaned = fixed.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()
          const fixedMatch = fixedCleaned.match(/\[[\s\S]*\]/)
          parsed = JSON.parse(fixedMatch ? fixedMatch[0] : fixedCleaned)
        } catch {
          setError(lang === 'zh' 
            ? '无法解析处方内容。请确保照片清晰且包含药物信息，然后重试。' 
            : lang === 'ko'
            ? '처방전을 분석할 수 없습니다. 사진이 선명한지 확인하고 다시 시도해 주세요.'
            : lang === 'ja'
            ? '処方箋を解析できませんでした。写真が鮮明であることを確認して、もう一度お試しください。'
            : 'Could not parse the prescription. Please make sure the photo is clear and contains medication information, then try again.')
          setLoading(false)
          return
        }
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError(lang === 'zh'
          ? '未能识别出药物信息。\n\n建议：\n• 确保处方文字清晰可见\n• 尝试在光线充足的环境下拍摄\n• 避免照片倾斜或有阴影\n• 可以尝试只拍摄药物信息部分'
          : lang === 'ko'
          ? '약물 정보를 인식하지 못했습니다.\n\n제안:\n• 처방전 글씨가 잘 보이는지 확인해 주세요\n• 밝은 곳에서 촬영해 보세요\n• 기울어지거나 그림자가 없도록 해주세요'
          : lang === 'ja'
          ? '薬の情報を認識できませんでした。\n\n提案：\n• 処方箋の文字がはっきり見えることを確認してください\n• 明るい場所で撮影してみてください\n• 傾きや影がないようにしてください'
          : 'No medications found.\n\nTips for better results:\n• Make sure the text is clearly visible\n• Use good lighting\n• Avoid shadows and tilted angles\n• Try capturing just the medication section')
        setLoading(false)
        return
      }

      // Normalize parsed data
      const normalized = parsed.map(med => ({
        name: med.name || 'Unknown',
        dose: String(med.dose || '1'),
        unit: med.unit || 'tablet',
        times: Array.isArray(med.times) ? med.times : ['08:00'],
        note: med.note || '',
        frequency: med.frequency || 'daily',
        originalText: med.originalText || '',
      }))

      const newMeds = []
      const duplicates = []

      for (const med of normalized) {
        const exists = medicines.some(existing => {
          const nameMatch = existing.name.toLowerCase().includes(med.name.toLowerCase()) ||
            med.name.toLowerCase().includes(existing.name.toLowerCase())
          const doseMatch = existing.dose === med.dose
          const timeMatch = JSON.stringify((existing.times || []).sort()) === JSON.stringify((med.times || []).sort())
          return nameMatch && doseMatch && timeMatch
        })
        if (exists) {
          duplicates.push(med)
        } else {
          newMeds.push(med)
        }
      }

      onReview({ newMeds, duplicates, allParsed: normalized })
      navigate('/review')
    } catch (err) {
      setError(lang === 'zh'
        ? '扫描过程中出错，请重试。'
        : lang === 'ko'
        ? '스캔 중 오류가 발생했습니다. 다시 시도해 주세요.'
        : 'Something went wrong during scanning. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFile = async (file) => {
    if (!file) return
    
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    
    setLoading(true)
    setError(null)
    setRetryCount(0)

    try {
      const { url } = await storage.upload(file, `prescription_${Date.now()}.jpg`)
      setUploadedUrl(url)
      await processImage(url)
    } catch (err) {
      setError(lang === 'zh'
        ? '上传失败，请检查网络后重试。'
        : 'Upload failed. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    if (uploadedUrl) {
      setRetryCount(prev => prev + 1)
      await processImage(uploadedUrl)
    }
  }

  const handleReset = () => {
    setPreview(null)
    setUploadedUrl(null)
    setError(null)
    setRetryCount(0)
  }

  const tipTexts = {
    en: ['Good lighting, no shadows', 'Keep the camera steady', 'Capture all medication text', 'Avoid glare on glossy paper'],
    zh: ['光线充足，避免阴影', '保持手机稳定', '拍摄完整的药物信息', '避免反光'],
    ko: ['조명이 밝은 곳에서', '카메라를 흔들리지 않게', '모든 약물 정보를 포함', '반사를 피해주세요'],
    ja: ['十分な明るさで', 'カメラを安定させて', 'すべての薬情報を写して', '反射を避けて'],
    es: ['Buena iluminación', 'Cámara estable', 'Capture todo el texto', 'Evite reflejos'],
    fr: ['Bon éclairage', 'Caméra stable', 'Capturez tout le texte', 'Évitez les reflets'],
    de: ['Gute Beleuchtung', 'Kamera ruhig halten', 'Gesamten Text erfassen', 'Reflexionen vermeiden'],
    it: ['Buona illuminazione', 'Fotocamera stabile', 'Cattura tutto il testo', 'Evita riflessi'],
    pt: ['Boa iluminação', 'Câmera estável', 'Capture todo o texto', 'Evite reflexos'],
    ar: ['إضاءة جيدة', 'ثبّت الكاميرا', 'التقط كل النص', 'تجنب الانعكاسات'],
  }
  const tips = tipTexts[lang] || tipTexts.en

  return (
    <div className="page-bg min-h-full px-5 relative overflow-hidden">
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="warm-orb warm-orb-sage absolute w-48 h-48" style={{ top: '-5%', left: '-15%' }} />
      <div className="warm-orb warm-orb-peach absolute w-36 h-36" style={{ top: '10%', right: '-10%' }} />

      {/* Header */}
      <div className="pt-10 pb-6 animate-fade-in-up relative z-10">
        <div className="flex items-center gap-4 mb-1">
          <div className="w-12 h-12 rounded-[18px] flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(92,140,126,0.12), rgba(200,220,208,0.15))',
              boxShadow: '0 4px 16px rgba(92,140,126,0.06)' }}>
            <ScanLine size={22} className="text-primary" strokeWidth={1.6} />
          </div>
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {t('scanPrescription', lang)}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="relative z-10 animate-fade-in">
          {/* Preview of uploaded image */}
          {preview && (
            <div className="glass-hero p-3 mb-6 overflow-hidden">
              <img src={preview} alt="Prescription" 
                className="w-full rounded-[20px] object-cover"
                style={{ maxHeight: 200 }} />
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-28 h-28 rounded-[32px] glass-hero flex items-center justify-center mb-7 relative">
              <Loader2 size={40} className="text-primary animate-spin" strokeWidth={1.3} />
              {/* Scanning animation ring */}
              <div className="absolute inset-0 rounded-[32px] animate-pulse" 
                style={{ border: '2px solid rgba(92,140,126,0.15)' }} />
            </div>
            <p className="text-[20px] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              {lang === 'zh' ? '正在智能识别...' : lang === 'ko' ? '스마트 분석 중...' : lang === 'ja' ? 'スマート分析中...' : 'Smart scanning...'}
            </p>
            <p className="text-[14px] mt-3 max-w-[280px] text-center leading-relaxed font-medium"
              style={{ color: 'rgb(var(--color-text-light))' }}>
              {lang === 'zh' ? '正在读取药物名称、剂量和服用时间' 
                : lang === 'ko' ? '약물명, 용량, 복용 시간을 읽고 있습니다'
                : lang === 'ja' ? '薬名、用量、服用時間を読み取っています'
                : 'Reading medication names, dosages, and schedules'}
            </p>
            <div className="mt-8 flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ 
                    background: 'rgb(var(--color-primary))',
                    opacity: 0.3,
                    animationDelay: `${i * 0.3}s`
                  }} />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="relative z-10 animate-fade-in-up">
          {/* Preview of the problematic image */}
          {preview && (
            <div className="glass-hero p-3 mb-5 overflow-hidden">
              <img src={preview} alt="Prescription" 
                className="w-full rounded-[20px] object-cover"
                style={{ maxHeight: 180, filter: 'brightness(0.95)' }} />
            </div>
          )}
          
          <div className="glass-card p-7 mb-5"
            style={{ background: 'rgba(198,108,105,0.04)', borderColor: 'rgba(198,108,105,0.1)' }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(198,108,105,0.08)' }}>
                <AlertTriangle size={19} style={{ color: 'rgb(var(--color-danger))' }} />
              </div>
              <div>
                <p className="font-bold text-[16px] mb-2" style={{ color: 'rgb(var(--color-danger))' }}>
                  {lang === 'zh' ? '识别遇到问题' : lang === 'ko' ? '인식에 문제가 있습니다' : 'Recognition issue'}
                </p>
                <p className="text-[14px] leading-relaxed font-medium whitespace-pre-line"
                  style={{ color: 'rgb(var(--color-text-light))' }}>
                  {error}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3.5 mb-6">
            {uploadedUrl && retryCount < 2 && (
              <button onClick={handleRetry}
                className="w-full glass-hero p-5 flex items-center justify-center gap-3 active:scale-[0.97] transition-all">
                <RotateCcw size={19} className="text-primary" />
                <span className="font-bold text-[16px]">
                  {lang === 'zh' ? '重新分析这张照片' : lang === 'ko' ? '이 사진 다시 분석' : 'Re-analyze this photo'}
                </span>
              </button>
            )}
            <button onClick={handleReset}
              className="w-full glass-hero p-5 flex items-center justify-center gap-3 active:scale-[0.97] transition-all">
              <ImagePlus size={19} className="text-secondary" />
              <span className="font-bold text-[16px]">
                {lang === 'zh' ? '拍摄新照片' : lang === 'ko' ? '새 사진 촬영' : 'Take a new photo'}
              </span>
            </button>
          </div>

          {/* Tips */}
          <div className="glass-card p-6">
            <p className="font-bold text-[14px] mb-4 flex items-center gap-2">
              <ZoomIn size={15} className="text-primary" />
              {lang === 'zh' ? '拍摄建议' : lang === 'ko' ? '촬영 팁' : 'Photo tips'}
            </p>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgb(var(--color-primary))' }} />
                  <span className="text-[13px] font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up stagger-1 relative z-10">
          {/* Info banner */}
          <div className="card-glow p-6 mb-6 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(92,140,126,0.1)' }}>
              <AlertTriangle size={17} className="text-primary" />
            </div>
            <p className="text-[14px] leading-relaxed font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
              {t('reviewBeforeSync', lang)}
            </p>
          </div>

          {/* Photo tips card */}
          <div className="glass-card p-5 mb-6">
            <p className="font-bold text-[13px] mb-3 flex items-center gap-2" style={{ color: 'rgb(var(--color-text-light))' }}>
              <ZoomIn size={13} />
              {lang === 'zh' ? '拍出好照片的小技巧' : lang === 'ko' ? '좋은 사진을 위한 팁' : 'Tips for best results'}
            </p>
            <div className="flex flex-wrap gap-2">
              {tips.map((tip, i) => (
                <span key={i} className="text-[12px] font-medium px-3 py-1.5 rounded-full"
                  style={{ 
                    background: 'rgba(92,140,126,0.06)',
                    color: 'rgb(var(--color-text-light))'
                  }}>
                  {tip}
                </span>
              ))}
            </div>
          </div>

          {/* Scan options */}
          <div className="space-y-5">
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full glass-hero p-10 flex flex-col items-center gap-5 active:scale-[0.97] transition-all"
            >
              <div className="w-20 h-20 rounded-[28px] flex items-center justify-center animate-float"
                style={{
                  background: 'linear-gradient(150deg, rgba(200,220,208,0.5), rgba(92,140,126,0.08))',
                  boxShadow: '0 8px 24px rgba(92,140,126,0.08)',
                }}>
                <Camera size={34} className="text-primary" strokeWidth={1.3} />
              </div>
              <div className="text-center">
                <span className="font-bold text-[17px] block">{t('takePhoto', lang)}</span>
                <span className="text-[13px] mt-1.5 block font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {lang === 'zh' ? '直接拍摄处方或药品标签' 
                    : lang === 'ko' ? '처방전 또는 약 라벨 촬영'
                    : lang === 'ja' ? '処方箋または薬のラベルを撮影'
                    : 'Prescription, label, or package'}
                </span>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full glass-hero p-10 flex flex-col items-center gap-5 active:scale-[0.97] transition-all"
            >
              <div className="w-20 h-20 rounded-[28px] flex items-center justify-center animate-float"
                style={{
                  animationDelay: '0.3s',
                  background: 'linear-gradient(150deg, rgba(248,232,218,0.5), rgba(186,146,112,0.08))',
                  boxShadow: '0 8px 24px rgba(186,146,112,0.06)',
                }}>
                <Upload size={34} className="text-secondary" strokeWidth={1.3} />
              </div>
              <div className="text-center">
                <span className="font-bold text-[17px] block">{t('uploadImage', lang)}</span>
                <span className="text-[13px] mt-1.5 block font-medium" style={{ color: 'rgb(var(--color-text-light))' }}>
                  {lang === 'zh' ? '从相册选择照片或截图' 
                    : lang === 'ko' ? '갤러리에서 사진 또는 스크린샷 선택'
                    : lang === 'ja' ? 'ギャラリーから写真を選択'
                    : 'Choose from gallery or screenshots'}
                </span>
              </div>
            </button>
          </div>

          {/* Supported formats */}
          <div className="mt-8 text-center">
            <p className="text-[12px] font-medium" style={{ color: 'rgb(var(--color-text-light))', opacity: 0.6 }}>
              {lang === 'zh' ? '支持：处方单 · 药品标签 · 药盒 · 药房单据 · 电子处方截图'
                : lang === 'ko' ? '지원: 처방전 · 약 라벨 · 약 상자 · 약국 영수증 · 전자처방 스크린샷'
                : lang === 'ja' ? '対応: 処方箋 · 薬ラベル · 薬箱 · 薬局レシート · 電子処方スクリーンショット'
                : 'Supports: prescriptions · labels · packages · pharmacy receipts · digital Rx screenshots'}
            </p>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { handleFile(e.target.files?.[0]); e.target.value = '' }}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { handleFile(e.target.files?.[0]); e.target.value = '' }}
          />
        </div>
      )}
    </div>
  )
}
