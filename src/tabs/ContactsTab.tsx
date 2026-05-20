import { useState } from 'react';
import { UserPlus, Phone, Trash2, Search, X } from 'lucide-react';
import type { ContactEntry } from '../types';
import type { SiteSettings } from '../lib/firebase';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];
const AVATARS = ['😊', '😎', '🤗', '🥳', '😄', '🤩', '😇', '🧑‍💼'];

function loadContacts(): ContactEntry[] {
  try { return JSON.parse(localStorage.getItem('vl_contacts') || '[]'); }
  catch { return []; }
}

function saveContacts(c: ContactEntry[]) {
  localStorage.setItem('vl_contacts', JSON.stringify(c));
}

interface Props { 
  onCall: (num: string) => void;
  settings: SiteSettings;
}

export default function ContactsTab({ onCall, settings }: Props) {
  const [contacts, setContacts] = useState<ContactEntry[]>(loadContacts);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [search, setSearch] = useState('');

  const addContact = () => {
    if (!newName.trim() || newId.length !== 6) return;
    const c: ContactEntry = {
      id: Date.now().toString(),
      name: newName.trim(),
      peerId: newId,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    const next = [c, ...contacts];
    setContacts(next);
    saveContacts(next);
    setNewName(''); setNewId(''); setShowAdd(false);
  };

  const removeContact = (id: string) => {
    const next = contacts.filter(c => c.id !== id);
    setContacts(next);
    saveContacts(next);
  };

  const filtered = contacts.filter(c => c.name.includes(search) || c.peerId.includes(search));

  return (
    <div className="flex flex-col h-full px-4 sm:px-6">
      <div className="flex items-center justify-between py-3">
        <h2 className="text-lg sm:text-xl font-bold">جهات الاتصال</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ backgroundColor: `${settings.primaryColor}20`, color: settings.primaryColor }}
        >
          <UserPlus size={17} />
        </button>
      </div>

      {contacts.length > 0 && (
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full bg-white/5 rounded-xl py-2.5 pr-9 pl-3 text-sm text-white placeholder-gray-600 border border-white/5 outline-none"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-4 space-y-1">
        {filtered.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: c.color + '20' }}>
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{c.name}</p>
              <p className="text-xs text-gray-500 font-mono" dir="ltr">#{c.peerId}</p>
            </div>
            <button onClick={() => onCall(c.peerId)}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90"
              style={{ backgroundColor: `${settings.primaryColor}20`, color: settings.primaryColor }}>
              <Phone size={15} />
            </button>
            <button onClick={() => removeContact(c.id)}
              className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center text-red-400 hidden group-hover:flex">
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm">لا توجد جهات اتصال</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-gray-900 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">إضافة جهة اتصال</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-500"><X size={18} /></button>
            </div>
            <input
              value={newName} onChange={e => setNewName(e.target.value)} placeholder="الاسم"
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-white placeholder-gray-600 border border-white/10 outline-none mb-3 text-right"
            />
            <input
              value={newId} onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setNewId(e.target.value); }}
              placeholder="الرقم (6 أرقام)" maxLength={6} dir="ltr"
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-white placeholder-gray-600 border border-white/10 outline-none text-center font-mono text-lg tracking-[0.3em]"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-white/5 rounded-xl text-gray-400">إلغاء</button>
              <button onClick={addContact} disabled={!newName.trim() || newId.length !== 6}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold disabled:opacity-30"
                style={{ backgroundColor: settings.primaryColor }}>حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
