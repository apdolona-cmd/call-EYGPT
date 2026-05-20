import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Trash2 } from 'lucide-react';
import type { CallLogEntry } from '../types';
import type { SiteSettings } from '../lib/firebase';

interface Props {
  logs: CallLogEntry[];
  onCall: (num: string) => void;
  onClear: () => void;
  settings: SiteSettings;
}

function formatDuration(s: number): string {
  if (s === 0) return '—';
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `اليوم ${time}`;
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) + ' ' + time;
}

export default function HistoryTab({ logs, onCall, onClear, settings }: Props) {
  const icon = (t: CallLogEntry['type']) => {
    switch (t) {
      case 'incoming': return <PhoneIncoming size={14} className="text-green-400" />;
      case 'outgoing': return <PhoneOutgoing size={14} style={{ color: settings.primaryColor }} />;
      case 'missed': return <PhoneMissed size={14} className="text-red-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full px-4 sm:px-6">
      <div className="flex items-center justify-between py-3">
        <h2 className="text-lg sm:text-xl font-bold">سجل المكالمات</h2>
        {logs.length > 0 && (
          <button onClick={onClear} className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 active:scale-90">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-4 space-y-1">
        {logs.map(log => (
          <div key={log.id} onClick={() => onCall(log.peerId)}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">{icon(log.type)}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${log.type === 'missed' ? 'text-red-400' : 'text-white'}`}>{log.name}</p>
              <p className="text-[10px] text-gray-500 font-mono" dir="ltr">#{log.peerId}</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-600">{formatTime(log.timestamp)}</p>
              <p className="text-[10px] text-gray-500">{formatDuration(log.duration)}</p>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <Phone size={40} className="opacity-20 mb-3" />
            <p className="text-sm">لا توجد مكالمات</p>
          </div>
        )}
      </div>
    </div>
  );
}
