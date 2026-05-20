import { useState, useRef, useEffect } from 'react';
import { X, Save, Upload, Palette, Type, Image, Check, Copy, Zap, RefreshCw } from 'lucide-react';
import { SiteSettings, saveSettingsInstant, testFirebase, isCloudOk, compressImage } from '../lib/firebase';

interface Props {
  settings: SiteSettings;
  onClose: () => void;
}

export default function AdminPanel({ settings, onClose }: Props) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [bgColor, setBgColor] = useState(settings.bgColor);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [saved, setSaved] = useState(false);
  const [cloudOk, setCloudOk] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCloudOk(isCloudOk() || null);
  }, []);

  // ===== حفظ فوري =====
  const handleSave = async () => {
    await saveSettingsInstant({ siteName, primaryColor, secondaryColor, bgColor, logoUrl });
    setSaved(true);
    setTimeout(() => window.location.reload(), 800);
  };

  // ===== رفع صورة فوري =====
  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const b64 = await compressImage(file);
      setLogoUrl(b64);
    } catch {}
  };

  // ===== اختبار Firebase =====
  const handleTest = async () => {
    setTesting(true);
    const ok = await testFirebase();
    setCloudOk(ok);
    setTesting(false);
    if (!ok) setShowRules(true);
  };

  const presets = [
    { n: 'أزرق', p: '#3b82f6', s: '#8b5cf6' },
    { n: 'أخضر', p: '#10b981', s: '#14b8a6' },
    { n: 'وردي', p: '#ec4899', s: '#f43f5e' },
    { n: 'برتقالي', p: '#f97316', s: '#eab308' },
    { n: 'أحمر', p: '#ef4444', s: '#dc2626' },
    { n: 'بنفسجي', p: '#a855f7', s: '#7c3aed' },
  ];

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{doc} {
      allow read, write: if true;
    }
  }
}`;

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] overflow-y-auto" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <div className="min-h-full flex items-start justify-center p-3 py-4">
        <div className="w-full max-w-md bg-[#111] rounded-2xl border border-white/10 shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">⚙️ لوحة الأدمن</h2>
              {cloudOk === true && <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">☁️ متصل</span>}
              {cloudOk === false && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">محلي فقط</span>}
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
          </div>

          <div className="p-4 space-y-3">

            {/* اسم الموقع */}
            <div>
              <p className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Type size={11} /> اسم الموقع</p>
              <input value={siteName} onChange={e => setSiteName(e.target.value)}
                className="w-full bg-white/5 rounded-xl py-2.5 px-3 text-white text-sm border border-white/10 focus:border-blue-500/40 outline-none" />
            </div>

            {/* الشعار */}
            <div>
              <p className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Image size={11} /> الشعار</p>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <div className="relative">
                    <img src={logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-white/10" />
                    <button onClick={() => setLogoUrl('')} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">✕</button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-gray-600"><Image size={18} /></div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="flex-1 py-2.5 bg-white/5 rounded-xl text-sm text-gray-300 flex items-center justify-center gap-2 hover:bg-white/8 active:scale-95 transition-all">
                  <Upload size={14} /> اختر صورة
                </button>
              </div>
            </div>

            {/* الألوان */}
            <div>
              <p className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Palette size={11} /> الألوان</p>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {presets.map(p => (
                  <button key={p.n} onClick={() => { setPrimaryColor(p.p); setSecondaryColor(p.s); }}
                    className="py-1.5 rounded-lg text-[10px] text-white active:scale-95 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${p.p}, ${p.s})` }}>{p.n}</button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'أساسي', v: primaryColor, set: setPrimaryColor },
                  { l: 'ثانوي', v: secondaryColor, set: setSecondaryColor },
                  { l: 'خلفية', v: bgColor, set: setBgColor },
                ].map(c => (
                  <div key={c.l}>
                    <p className="text-[9px] text-gray-500 mb-0.5">{c.l}</p>
                    <input type="color" value={c.v} onChange={e => c.set(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* معاينة */}
            <div className="p-3 rounded-xl border border-white/10" style={{ backgroundColor: bgColor }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {logoUrl && <img src={logoUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />}
                <p className="text-sm font-bold" style={{ background: `linear-gradient(to left, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {siteName || 'معاينة'}
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 rounded text-[9px] text-white" style={{ backgroundColor: primaryColor }}>أساسي</span>
                <span className="px-3 py-1 rounded text-[9px] text-white" style={{ backgroundColor: secondaryColor }}>ثانوي</span>
              </div>
            </div>

            {/* حفظ */}
            <button onClick={handleSave} disabled={saved}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition-all"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
              {saved ? <><Check size={16} /> تم الحفظ!</> : <><Save size={16} /> حفظ التغييرات</>}
            </button>

            {/* ===== قسم المزامنة ===== */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              <p className="text-xs text-gray-400 font-bold">☁️ مزامنة التغييرات مع الجميع</p>

              {/* اختبار */}
              <button onClick={handleTest} disabled={testing}
                className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 active:scale-[0.98] transition-all">
                {testing ? <RefreshCw size={16} className="text-blue-400 animate-spin" /> : <Zap size={16} className={cloudOk ? 'text-green-400' : 'text-yellow-400'} />}
                <span className="text-xs text-white flex-1 text-right">
                  {testing ? 'جاري الاختبار...' : cloudOk ? '✅ Firebase متصل!' : 'اختبار اتصال Firebase'}
                </span>
              </button>

              {/* حالة */}
              {cloudOk === true && (
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-[10px] text-green-400 text-center">✅ التغييرات ستظهر عند جميع المستخدمين فوراً</p>
                </div>
              )}

              {cloudOk === false && (
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-[10px] text-yellow-400 text-center">⚠️ التغييرات تُحفظ محلياً فقط - اتبع الخطوات بالأسفل للمزامنة</p>
                </div>
              )}

              {/* تعليمات */}
              <button onClick={() => setShowRules(!showRules)}
                className="w-full p-2 bg-white/5 rounded-lg text-[11px] text-gray-400 hover:text-white text-center">
                {showRules ? '▲ إخفاء التعليمات' : '▼ كيف أفعّل المزامنة؟'}
              </button>

              {showRules && (
                <div className="p-3 bg-[#0a0a0f] rounded-xl border border-white/10 space-y-2">
                  <p className="text-xs text-white font-bold">📋 الخطوات:</p>
                  <p className="text-[11px] text-gray-300">1. افتح
                    <a href="https://console.firebase.google.com/project/call-eygpt/firestore/rules" target="_blank" rel="noopener"
                      className="text-blue-400 underline mx-1">صفحة قواعد Firestore</a>
                  </p>
                  <p className="text-[11px] text-gray-300">2. امسح كل الكود واستبدله بـ:</p>

                  <div className="relative">
                    <pre className="bg-black p-2.5 rounded-lg text-[9px] text-green-400 overflow-x-auto whitespace-pre border border-green-500/20 leading-relaxed" dir="ltr">{rules}</pre>
                    <button onClick={() => { navigator.clipboard.writeText(rules); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="absolute top-1.5 left-1.5 px-2 py-1 bg-white/10 rounded text-[9px] text-gray-300 flex items-center gap-1">
                      {copied ? <><Check size={10} className="text-green-400" /> تم</> : <><Copy size={10} /> نسخ</>}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-300">3. اضغط <strong className="text-white">Publish</strong></p>
                  <p className="text-[11px] text-gray-300">4. ارجع هنا واضغط <strong className="text-white">"اختبار اتصال Firebase"</strong></p>
                </div>
              )}

              <p className="text-center text-[9px] text-gray-600">الدومين: <span className="font-mono" dir="ltr">{window.location.host}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
