import { useState, useCallback } from 'react';
import { Phone, Delete } from 'lucide-react';
import type { SiteSettings } from '../lib/firebase';

const keys = [
  { d: '1', s: '' }, { d: '2', s: 'ABC' }, { d: '3', s: 'DEF' },
  { d: '4', s: 'GHI' }, { d: '5', s: 'JKL' }, { d: '6', s: 'MNO' },
  { d: '7', s: 'PQRS' }, { d: '8', s: 'TUV' }, { d: '9', s: 'WXYZ' },
  { d: '*', s: '' }, { d: '0', s: '+' }, { d: '#', s: '' },
];

interface Props { 
  onCall: (num: string) => void;
  settings: SiteSettings;
}

export default function DialerTab({ onCall, settings }: Props) {
  const [num, setNum] = useState('');

  const press = (d: string) => {
    if (num.length < 6) { setNum(p => p + d); playTone(d); }
  };

  const del = () => setNum(p => p.slice(0, -1));

  const call = () => {
    if (num.length === 6) onCall(num);
  };

  const playTone = useCallback((digit: string) => {
    try {
      const ctx = new AudioContext();
      const freqs: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
      };
      const f = freqs[digit];
      if (f) {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        g.gain.value = 0.05;
        o1.frequency.value = f[0]; o2.frequency.value = f[1];
        o1.connect(g); o2.connect(g); g.connect(ctx.destination);
        o1.start(); o2.start();
        setTimeout(() => { o1.stop(); o2.stop(); ctx.close(); }, 70);
      }
    } catch {}
  }, []);

  const isValid = num.length === 6;

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 pb-4">
      {/* Display */}
      <div className="py-4 sm:py-6 text-center min-h-[80px] flex flex-col items-center justify-center relative">
        {num ? (
          <span className="text-3xl sm:text-4xl font-mono font-light tracking-[0.2em] text-white" dir="ltr">
            {num}
          </span>
        ) : (
          <span className="text-base sm:text-lg text-gray-600">أدخل رقم من 6 أرقام</span>
        )}
        {num && (
          <button
            onClick={del}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white active:scale-90 transition-transform"
          >
            <Delete size={20} />
          </button>
        )}
        {num && (
          <p className={`text-xs mt-2 ${isValid ? 'text-green-400' : 'text-gray-600'}`}>
            {isValid ? '✓ رقم صالح' : `${6 - num.length} متبقية`}
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="flex-1 flex flex-col justify-center max-w-[300px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {keys.map(({ d, s }) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="aspect-square max-h-[60px] sm:max-h-[68px] rounded-full bg-white/8 hover:bg-white/12 active:bg-white/20 active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-xl sm:text-2xl font-light text-white">{d}</span>
              {s && <span className="text-[8px] sm:text-[9px] text-gray-500">{s}</span>}
            </button>
          ))}
        </div>

        {/* Call Button */}
        <div className="flex justify-center mt-5 sm:mt-6">
          <button
            onClick={call}
            disabled={!isValid}
            className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-30"
            style={{ 
              backgroundColor: isValid ? settings.primaryColor : 'rgba(255,255,255,0.05)',
              boxShadow: isValid ? `0 10px 40px ${settings.primaryColor}40` : 'none',
            }}
          >
            <Phone size={26} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
