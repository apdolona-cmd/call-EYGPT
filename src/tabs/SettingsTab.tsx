import { useState, useRef } from 'react';
import { User, Share2, Info, Copy, Check, Image, X } from 'lucide-react';
import type { SiteSettings } from '../lib/firebase';

interface Props {
  myName: string;
  myNumber: string;
  myAvatar?: string;
  onNameChange: (name: string) => void;
  onAvatarChange?: (avatar: string) => void;
  settings: SiteSettings;
}

export default function SettingsTab({ myName, myNumber, myAvatar, onNameChange, onAvatarChange, settings }: Props) {
  const [name, setName] = useState(myName);
  const [avatar, setAvatar] = useState(myAvatar || '');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    onNameChange(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
      onAvatarChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar('');
    onAvatarChange?.('');
  };

  const shareLink = () => {
    const text = `اتصل بي على ${settings.siteName}!\nرقمي: ${myNumber}\n${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: settings.siteName, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyNum = () => {
    navigator.clipboard.writeText(myNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 pb-4 overflow-y-auto">
      <h2 className="text-lg sm:text-xl font-bold py-3">الإعدادات</h2>

      {/* Avatar */}
      <div className="bg-white/5 rounded-2xl p-3.5 mb-4 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}20` }}>
            <Image size={16} style={{ color: settings.primaryColor }} />
          </div>
          <p className="text-sm font-medium text-white">صورتك الشخصية</p>
        </div>
        <div className="flex items-center gap-3">
          {avatar ? (
            <div className="relative">
              <img src={avatar} alt="avatar" className="w-12 h-12 rounded-xl object-cover" />
              <button onClick={removeAvatar} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-gray-600">
              <User size={20} />
            </div>
          )}
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: settings.primaryColor }}>
              {avatar ? 'غيّر' : 'أضف صورة'}
            </button>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="bg-white/5 rounded-2xl p-3.5 mb-4 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}20` }}>
            <User size={16} style={{ color: settings.primaryColor }} />
          </div>
          <p className="text-sm font-medium text-white">اسمك</p>
        </div>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك..."
            className="flex-1 bg-white/5 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 border border-white/5 outline-none text-right" />
          <button onClick={save} className="px-4 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: settings.primaryColor }}>
            {saved ? '✓' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Share */}
      <button onClick={shareLink}
        className="w-full rounded-2xl p-3.5 border mb-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
        style={{ background: `linear-gradient(135deg, ${settings.primaryColor}10, ${settings.secondaryColor}10)`, borderColor: `${settings.primaryColor}20` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}20` }}>
          <Share2 size={16} style={{ color: settings.primaryColor }} />
        </div>
        <div className="text-right flex-1">
          <p className="text-sm font-medium text-white">شارك رابط التطبيق</p>
          <p className="text-[10px] text-gray-500">أرسل الرابط لأصدقائك</p>
        </div>
      </button>

      {/* How it works */}
      <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${settings.secondaryColor}20` }}>
            <Info size={16} style={{ color: settings.secondaryColor }} />
          </div>
          <p className="text-sm font-medium text-white">كيف يعمل؟</p>
        </div>
        <div className="space-y-2 text-[11px] text-gray-400">
          <p>1️⃣ كل مستخدم يحصل على رقم ثابت</p>
          <p>2️⃣ شارك الرابط مع أصدقائك</p>
          <p>3️⃣ تبادلوا الأرقام واتصلوا</p>
          <p>🔒 الاتصال مشفر ومباشر</p>
        </div>
      </div>

      {/* My Number */}
      <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 text-center">
        <p className="text-xs text-gray-500 mb-1">رقمك الثابت</p>
        <p className="text-2xl font-mono font-bold tracking-[0.2em] text-white" dir="ltr">{myNumber}</p>
        <button onClick={copyNum} className="mt-2 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 inline-flex items-center gap-1.5">
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'تم!' : 'نسخ'}
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-700 mt-6">{settings.siteName} v1.0</p>
    </div>
  );
}
