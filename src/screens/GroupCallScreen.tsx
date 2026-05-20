import { Phone, PhoneOff, Plus, X, Zap } from 'lucide-react';
import type { SiteSettings } from '../lib/firebase';
import type { CallState } from '../types';

interface GroupParticipant {
  peerId: string;
  phoneNumber: string;
  name: string;
  avatar: string;
  connected: boolean;
}

interface Props {
  state: CallState;
  participants: GroupParticipant[];
  duration: number;
  isMuted: boolean;
  groupCode: string;
  onHangUp: () => void;
  onToggleMute: () => void;
  onAddParticipant: (number: string) => void;
  onRemoveParticipant: (peerId: string) => void;
  settings: SiteSettings;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GroupCallScreen({
  state, participants, duration, isMuted, groupCode, onHangUp, onToggleMute, onAddParticipant, onRemoveParticipant, settings
}: Props) {
  const connectedCount = participants.filter(p => p.connected).length;
  
  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col py-4 sm:py-6 px-3 sm:px-4" 
      dir="rtl"
      style={{ backgroundColor: settings.bgColor, fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: settings.primaryColor }}>
          مكالمة جماعية
        </h2>
        <p className="text-xs text-gray-400 mb-2">
          {connectedCount} مشارك | {formatDuration(duration)}
        </p>
        {groupCode && (
          <div className="inline-block px-3 py-1 rounded-full border" style={{ borderColor: `${settings.primaryColor}40`, backgroundColor: `${settings.primaryColor}10` }}>
            <p className="text-xs font-mono" style={{ color: settings.primaryColor }}>الرمز: {groupCode}</p>
          </div>
        )}
      </div>

      {/* Participants Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 overflow-y-auto">
        {participants.map(p => (
          <div key={p.peerId} className="relative rounded-xl p-2 overflow-hidden" style={{ backgroundColor: `${settings.primaryColor}10` }}>
            {/* Avatar */}
            <div className="relative w-full aspect-square rounded-lg mb-2 overflow-hidden flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}20` }}>
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl font-bold">{p.name ? p.name[0] : '👤'}</div>
              )}
              
              {/* Status Indicator */}
              <div className="absolute top-1 right-1">
                <div className={`w-3 h-3 rounded-full border-2 ${p.connected ? 'bg-green-500 border-green-500' : 'bg-gray-500 border-gray-500'}`} />
              </div>

              {/* Mute Indicator */}
              {p.isMuted && (
                <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <Zap size={10} className="text-white" />
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => onRemoveParticipant(p.peerId)}
                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Name */}
            <div className="text-center">
              <p className="text-xs font-medium truncate">{p.name || 'مجهول'}</p>
              <p className="text-[10px] text-gray-500 font-mono">{p.phoneNumber}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 space-y-3">
        {/* Add Participant Button */}
        {state === 'connected' && (
          <button
            onClick={() => {
              const number = prompt('أدخل رقم المشارك:');
              if (number) onAddParticipant(number);
            }}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Plus size={18} />
            أضف مشارك
          </button>
        )}

        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95 ${
            isMuted ? 'opacity-50' : ''
          }`}
          style={{ backgroundColor: isMuted ? '#ef4444' : settings.secondaryColor }}
        >
          {isMuted ? '🔇 كاتم الصوت' : '🔊 الميكروفون'}
        </button>

        {/* End Call Button */}
        <button
          onClick={onHangUp}
          className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <PhoneOff size={18} />
          إنهاء المكالمة
        </button>
      </div>
    </div>
  );
}
