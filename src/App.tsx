import { useState, useEffect } from 'react';
import { Phone, Users, Clock, Settings, Copy, Check, Wifi, WifiOff, Shield, X } from 'lucide-react';
import { usePeer } from './hooks/usePeer';
import { useSettings } from './hooks/useSettings';
import { useGroupCall } from './hooks/useGroupCall';
import type { AppTab } from './types';
import DialerTab from './tabs/DialerTab';
import ContactsTab from './tabs/ContactsTab';
import HistoryTab from './tabs/HistoryTab';
import SettingsTab from './tabs/SettingsTab';
import GroupCallTab from './tabs/GroupCallTab';
import ActiveCallScreen from './screens/ActiveCallScreen';
import IncomingCallScreen from './screens/IncomingCallScreen';
import GroupCallScreen from './screens/GroupCallScreen';
import AdminPanel from './screens/AdminPanel';

interface AppProps {
  onReady?: () => void;
}

function App({ onReady }: AppProps) {
  const peer = usePeer();
  const { settings } = useSettings();
  const group = useGroupCall();
  const [tab, setTab] = useState<AppTab>('dialer');
  const [copied, setCopied] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  // تطبيق الألوان
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    document.documentElement.style.setProperty('--bg-color', settings.bgColor);
    document.body.style.backgroundColor = settings.bgColor;
    document.title = settings.siteName;
  }, [settings]);

  // إخفاء شاشة التحميل
  useEffect(() => {
    // إخفاء شاشة التحميل بعد عرض الواجهة
    const timer = setTimeout(() => {
      onReady?.();
    }, 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  const copyNumber = () => {
    navigator.clipboard.writeText(peer.myNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAdminAccess = () => {
    if (adminInput === settings.adminPassword) {
      setShowAdmin(true);
      setShowAdminPrompt(false);
      setAdminInput('');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const tabs: { id: AppTab; icon: typeof Phone; label: string }[] = [
    { id: 'dialer', icon: Phone, label: 'اتصال' },
    { id: 'contacts', icon: Users, label: 'جهات' },
    { id: 'history', icon: Clock, label: 'السجل' },
    { id: 'settings', icon: Settings, label: 'إعدادات' },
    { id: 'group', icon: Users, label: 'جماعي' },
  ];

  // شاشات المكالمات
  if (peer.callState === 'ringing') {
    return <IncomingCallScreen callerName={peer.remoteName} callerNumber={peer.remoteNumber} callerAvatar={peer.remoteAvatar} onAnswer={peer.answerCall} onReject={peer.rejectCall} settings={settings} />;
  }

  if (peer.callState === 'calling' || peer.callState === 'connected' || peer.callState === 'ended') {
    return <ActiveCallScreen state={peer.callState} remoteName={peer.remoteName} remoteNumber={peer.remoteNumber} remoteAvatar={peer.remoteAvatar} duration={peer.callDuration}
      isMuted={peer.isMuted} isSpeaker={peer.isSpeaker} onHangUp={peer.hangUp} onToggleMute={peer.toggleMute} onToggleSpeaker={peer.toggleSpeaker} settings={settings} />;
  }

  // شاشة المكالمة الجماعية
  if (group.callState === 'calling' || group.callState === 'connected' || group.callState === 'ended') {
    return <GroupCallScreen state={group.callState} participants={group.participants} duration={group.duration} isMuted={group.isMuted} groupCode={group.groupCode}
      onHangUp={group.endGroupCall} onToggleMute={group.toggleMute} onAddParticipant={group.addParticipant} onRemoveParticipant={group.removeParticipant} settings={settings} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] text-white flex flex-col overflow-hidden"
      style={{ backgroundColor: settings.bgColor, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      
      {/* Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {settings.logoUrl && <img src={settings.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold"
                style={{ background: `linear-gradient(to left, ${settings.primaryColor}, ${settings.secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {settings.siteName}
              </h1>
              <p className="text-[10px] text-gray-500">اتصال صوتي حقيقي مجاني</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdminPrompt(true)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 hover:text-gray-400">
              <Shield size={14} />
            </button>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${peer.isConnected ? '' : 'bg-red-500/10 border-red-500/20'}`}
              style={peer.isConnected ? { backgroundColor: `${settings.primaryColor}15`, borderColor: `${settings.primaryColor}30` } : {}}>
              {peer.isConnected ? <Wifi size={12} style={{ color: settings.primaryColor }} /> : <WifiOff size={12} className="text-red-400" />}
              <span className="text-[10px]" style={{ color: peer.isConnected ? settings.primaryColor : '#f87171' }}>
                {peer.isLoading ? 'جاري...' : peer.isConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>
        </div>

        {/* My Number */}
        <div className="rounded-2xl p-3 sm:p-4 border"
          style={{ background: `linear-gradient(135deg, ${settings.primaryColor}15, ${settings.secondaryColor}15)`, borderColor: `${settings.primaryColor}20` }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 mb-0.5">رقمك الثابت</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-[0.15em] text-white truncate" dir="ltr">{peer.myNumber}</p>
              <p className="text-[9px] text-gray-500 mt-1">شارك هذا الرقم ليتصل بك أي شخص</p>
            </div>
            <button onClick={copyNumber} className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 active:scale-90 transition-transform"
              style={{ backgroundColor: `${settings.primaryColor}20` }}>
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} style={{ color: settings.primaryColor }} />}
            </button>
          </div>
          {copied && <p className="text-xs text-green-400 mt-2 text-center">✅ تم نسخ الرقم</p>}
        </div>

        {/* Error */}
        {peer.error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
            <span className="text-sm text-red-400">{peer.error}</span>
            <button onClick={() => peer.setError('')} className="text-red-400 px-2">✕</button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'dialer' && <DialerTab onCall={peer.makeCall} settings={settings} />}
        {tab === 'contacts' && <ContactsTab onCall={peer.makeCall} settings={settings} />}
        {tab === 'history' && <HistoryTab logs={peer.callLog} onCall={peer.makeCall} onClear={peer.clearCallLog} settings={settings} />}
        {tab === 'settings' && <SettingsTab myName={peer.myName} myNumber={peer.myNumber} myAvatar={peer.myAvatar} onNameChange={peer.updateMyName} onAvatarChange={peer.updateMyAvatar} settings={settings} />}
        {tab === 'group' && <GroupCallTab myNumber={peer.myNumber} groupCode={group.groupCode} onCreateGroup={group.createGroup} onJoinGroup={group.joinGroup} onCall={peer.makeCall} settings={settings} />}
      </main>

      {/* Nav */}
      <nav className="flex-shrink-0 backdrop-blur-xl border-t border-white/5 safe-bottom" style={{ backgroundColor: `${settings.bgColor}ee` }}>
        <div className="flex items-center justify-around py-2 sm:py-3 max-w-md mx-auto">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex flex-col items-center gap-0.5 px-3 sm:px-5 py-1 relative min-w-[60px] active:scale-90 transition-transform">
                {active && <div className="absolute -top-2 w-6 h-0.5 rounded-full" style={{ backgroundColor: settings.primaryColor }} />}
                <t.icon size={20} style={{ color: active ? settings.primaryColor : '#4b5563' }} />
                <span className="text-[9px] sm:text-[10px]" style={{ color: active ? settings.primaryColor : '#4b5563', fontWeight: active ? 700 : 400 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Admin Prompt */}
      {showAdminPrompt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAdminPrompt(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-[#111] rounded-2xl p-5 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">🔐 دخول لوحة التحكم</h3>
              <button onClick={() => setShowAdminPrompt(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <input 
              type="password" 
              value={adminInput} 
              onChange={e => setAdminInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleAdminAccess()}
              placeholder="أدخل كلمة المرور" 
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-white text-center border border-white/10 outline-none focus:border-blue-500/50 mb-4" 
              autoFocus 
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAdminPrompt(false)} className="flex-1 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10">إلغاء</button>
              <button onClick={handleAdminAccess} className="flex-1 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: settings.primaryColor }}>دخول</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && <AdminPanel settings={settings} onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

export default App;
