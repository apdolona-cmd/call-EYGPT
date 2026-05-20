import { Phone, PhoneOff } from 'lucide-react';
import type { SiteSettings } from '../lib/firebase';

interface Props {
  callerName: string;
  callerNumber: string;
  onAnswer: () => void;
  onReject: () => void;
  settings: SiteSettings;
}

export default function IncomingCallScreen({ callerName, callerNumber, onAnswer, onReject, settings }: Props) {
  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between py-12 sm:py-16 px-4" 
      dir="rtl"
      style={{ backgroundColor: settings.bgColor, fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="text-center">
        <p className="text-sm mb-6 animate-pulse" style={{ color: settings.primaryColor }}>📞 مكالمة واردة</p>

        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6">
          <div 
            className="w-full h-full rounded-full flex items-center justify-center text-5xl sm:text-6xl border animate-pulse"
            style={{ 
              background: `linear-gradient(135deg, ${settings.primaryColor}20, ${settings.secondaryColor}20)`,
              borderColor: `${settings.primaryColor}30`
            }}
          >
            {callerName ? callerName[0] : '📞'}
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{callerName || 'مجهول'}</h2>
        <p className="text-gray-500 font-mono text-lg" dir="ltr">#{callerNumber}</p>
      </div>

      <p className="text-gray-600 text-sm animate-pulse">يمكنك الرد أو الرفض</p>

      <div className="flex items-center gap-12 sm:gap-16">
        <button onClick={onReject} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
          <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <PhoneOff size={26} className="text-white rotate-[135deg]" />
          </div>
          <span className="text-xs text-red-400">رفض</span>
        </button>

        <button onClick={onAnswer} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
          <div 
            className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center shadow-lg animate-pulse"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Phone size={26} className="text-white" />
          </div>
          <span className="text-xs" style={{ color: settings.primaryColor }}>رد</span>
        </button>
      </div>
    </div>
  );
}
