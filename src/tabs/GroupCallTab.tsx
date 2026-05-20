import { useState } from 'react';
import { Users, Copy, Check, Phone } from 'lucide-react';
import type { SiteSettings } from '../lib/firebase';

interface Props {
  myNumber: string;
  groupCode?: string;
  onCreateGroup: () => Promise<string>;
  onJoinGroup: (number: string) => void;
  onCall: (number: string) => void;
  settings: SiteSettings;
}

export default function GroupCallTab({ myNumber, groupCode, onCreateGroup, onJoinGroup, onCall, settings }: Props) {
  const [joinNumber, setJoinNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateGroup = async () => {
    setCreating(true);
    try {
      await onCreateGroup();
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (joinNumber.trim()) {
      onJoinGroup(joinNumber.trim());
      setJoinNumber('');
    }
  };

  const copyGroupCode = () => {
    if (groupCode) {
      navigator.clipboard.writeText(groupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 pb-4 overflow-y-auto">
      <h2 className="text-lg sm:text-xl font-bold py-3">مكالمة جماعية</h2>

      {/* Create Group */}
      <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}20` }}>
            <Users size={18} style={{ color: settings.primaryColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">إنشاء مجموعة جديدة</p>
            <p className="text-xs text-gray-500">ابدأ مكالمة جماعية</p>
          </div>
        </div>
        <button
          onClick={handleCreateGroup}
          disabled={creating}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: settings.primaryColor }}
        >
          {creating ? 'جاري الإنشاء...' : '➕ إنشاء مجموعة'}
        </button>
      </div>

      {/* Join Group */}
      <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${settings.secondaryColor}20` }}>
            <Phone size={18} style={{ color: settings.secondaryColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">الانضمام لمجموعة</p>
            <p className="text-xs text-gray-500">أدخل رقم صديقك</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={joinNumber}
            onChange={e => setJoinNumber(e.target.value)}
            placeholder="رقم صديقك..."
            className="flex-1 bg-white/5 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 border border-white/5 outline-none text-right"
          />
          <button
            onClick={handleJoin}
            disabled={!joinNumber.trim()}
            className="px-4 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: settings.secondaryColor }}
          >
            انضم
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-medium text-white mb-3">💡 كيف تعمل المكالمات الجماعية؟</p>
        <ul className="space-y-2 text-[11px] text-gray-400">
          <li>✓ انضم عدة أشخاص في مكالمة واحدة</li>
          <li>✓ أضف مشاركين أثناء المكالمة</li>
          <li>✓ صوت واضح بدون تأخير</li>
          <li>✓ كاتم صوت فردي لكل مشارك</li>
        </ul>
      </div>
    </div>
  );
}
