export interface ContactEntry {
  id: string;
  name: string;
  peerId: string;
  avatar: string;
  color: string;
}

export interface CallLogEntry {
  id: string;
  name: string;
  peerId: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: number; // seconds
  timestamp: number;
}

export type CallState = 
  | 'idle'
  | 'calling'       // أنا اتصلت وانتظر الرد
  | 'ringing'        // شخص يتصل بي
  | 'connected'      // المكالمة جارية
  | 'ended';         // المكالمة انتهت

export type AppTab = 'dialer' | 'contacts' | 'history' | 'settings' | 'group';
