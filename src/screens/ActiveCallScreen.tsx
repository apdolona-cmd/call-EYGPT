import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import type { CallState } from '../types';
import type { SiteSettings } from '../lib/firebase';

interface Props {
  state: CallState;
  remoteName: string;
  remoteNumber: string;
  remoteAvatar?: string;
  duration: number;
  isMuted: boolean;
  isSpeaker: boolean;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  settings: SiteSettings;
}

function fmtDur(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function ActiveCallScreen({
  state, remoteName, remoteNumber, remoteAvatar, duration,
  isMuted, isSpeaker, onHangUp, onToggleMute, onToggleSpeaker, settings
}: Props) {
  const statusText = state === 'calling' ? 'جاري الاتصال...' : state === 'connected' ? fmtDur(duration) : 'انتهت المكالمة';

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between py-12 sm:py-16 px-4" 
      dir="rtl"
      style={{ backgroundColor: settings.bgColor, fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="text-center">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-5">
          <div 
            className="w-full h-full rounded-full flex items-center justify-center text-4xl sm:text-5xl border overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${settings.primaryColor}25, ${settings.secondaryColor}25)`,
              borderColor: `${settings.primaryColor}20`
            }}
          >
            {remoteAvatar ? (
              <img src={remoteAvatar} alt={remoteName} className="w-full h-full object-cover" />
            ) : (
              remoteName ? remoteName[0] : '📞'
            )}
          </div>
          {state === 'connected' && (
            <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-green-500 border-4 flex items-center justify-center"
              style={{ borderColor: settings.bgColor }}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{remoteName || 'جاري الاتصال'}</h2>
        <p className="text-gray-500 font-mono text-base mb-3" dir="ltr">#{remoteNumber}</p>

        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm ${
          state === 'connected' ? 'bg-green-500/20 text-green-400' : state === 'ended' ? 'bg-red-500/20 text-red-400' : ''
        }`} style={state === 'calling' ? { backgroundColor: `${settings.primaryColor}20`, color: settings.primaryColor } : {}}>
          {state === 'calling' && <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${settings.primaryColor}60` }} />}
          {state === 'connected' && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          {statusText}
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-8">
        <button onClick={onToggleMute} disabled={state !== 'connected'} className="flex flex-col items-center gap-2 disabled:opacity-30">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${isMuted ? 'bg-white text-gray-900' : 'bg-white/10 text-white'}`}>
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </div>
          <span className="text-[10px] text-gray-500">{isMuted ? 'إلغاء' : 'كتم'}</span>
        </button>

        <button onClick={onToggleSpeaker} disabled={state !== 'connected'} className="flex flex-col items-center gap-2 disabled:opacity-30">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${isSpeaker ? 'bg-white text-gray-900' : 'bg-white/10 text-white'}`}>
            {isSpeaker ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </div>
          <span className="text-[10px] text-gray-500">{isSpeaker ? 'عادي' : 'سماعة'}</span>
        </button>
      </div>

      <button onClick={onHangUp}
        className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-xl shadow-red-500/30 active:scale-90 transition-transform">
        <PhoneOff size={28} className="text-white rotate-[135deg]" />
      </button>
    </div>
  );
}
