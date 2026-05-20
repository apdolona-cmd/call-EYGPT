import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import type { CallState, CallLogEntry } from '../types';

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

function loadCallLog(): CallLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem('vl_log') || '[]');
  } catch { return []; }
}

function saveCallLog(log: CallLogEntry[]) {
  localStorage.setItem('vl_log', JSON.stringify(log));
}

function getMyNumber(): string {
  let num = localStorage.getItem('vl_num');
  if (!num) {
    num = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('vl_num', num);
  }
  return num;
}

export function usePeer() {
  const [myNumber] = useState(getMyNumber);
  const [myName, setMyName] = useState(() => localStorage.getItem('vl_name') || '');
  const [callState, setCallState] = useState<CallState>('idle');
  const [remoteName, setRemoteName] = useState('');
  const [remoteNumber, setRemoteNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [callLog, setCallLog] = useState<CallLogEntry[]>(loadCallLog);
  const [isLoading, setIsLoading] = useState(true);

  const peerRef = useRef<Peer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataConnRef = useRef<any>(null);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);
  const callStateRef = useRef<CallState>('idle');

  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const updateMyName = useCallback((n: string) => {
    setMyName(n);
    localStorage.setItem('vl_name', n);
  }, []);

  const addLog = useCallback((entry: Omit<CallLogEntry, 'id'>) => {
    setCallLog(prev => {
      const next = [{ ...entry, id: Date.now().toString() }, ...prev].slice(0, 30);
      saveCallLog(next);
      return next;
    });
  }, []);

  const clearCallLog = useCallback(() => {
    setCallLog([]);
    saveCallLog([]);
  }, []);

  const playRingtone = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      osc.type = 'sine';
      gain.gain.value = 0;
      osc.start();
      let on = true;
      const iv = setInterval(() => {
        gain.gain.setTargetAtTime(on ? 0.12 : 0, ctx.currentTime, 0.02);
        on = !on;
      }, 400);
      const to = setTimeout(() => { clearInterval(iv); osc.stop(); ctx.close(); }, 30000);
      ringtoneRef.current = {
        stop: () => {
          clearInterval(iv); clearTimeout(to);
          gain.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
          setTimeout(() => { try { osc.stop(); ctx.close(); } catch {} }, 100);
        }
      };
    } catch {}
  }, []);

  const stopRingtone = useCallback(() => {
    ringtoneRef.current?.stop();
    ringtoneRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    stopRingtone();
    if (durationRef.current) { clearInterval(durationRef.current); durationRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    try { callRef.current?.close(); } catch {}
    callRef.current = null;
    try { dataConnRef.current?.close(); } catch {}
    dataConnRef.current = null;
    setCallState('ended');
    setIsMuted(false);
    setIsSpeaker(false);
    setTimeout(() => {
      setCallState('idle');
      setRemoteName('');
      setRemoteNumber('');
      setCallDuration(0);
    }, 1500);
  }, [stopRingtone]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setCallDuration(0);
    durationRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  // تهيئة PeerJS
  useEffect(() => {
    const peerId = `voicelink-${myNumber}`;
    
    // تأخير بسيط لتحسين التحميل
    const initTimer = setTimeout(() => {
      const peer = new Peer(peerId, { debug: 0 });

      peer.on('open', () => { 
        setIsConnected(true); 
        setIsLoading(false);
        setError(''); 
      });

      peer.on('error', (err) => {
        setIsLoading(false);
        if (err.type === 'unavailable-id') {
          localStorage.removeItem('vl_num');
          setTimeout(() => window.location.reload(), 1500);
        } else if (err.type === 'peer-unavailable') {
          setError('هذا الرقم غير متصل حالياً');
          cleanup();
        } else if (err.type === 'disconnected') {
          setIsConnected(false);
          peer.reconnect();
        }
      });

      peer.on('disconnected', () => { setIsConnected(false); peer.reconnect(); });

      peer.on('call', (incoming) => {
        callRef.current = incoming;
        setCallState('ringing');
        setRemoteNumber(incoming.peer.replace('voicelink-', ''));
        playRingtone();
        incoming.on('close', () => { cleanup(); });
      });

      peer.on('connection', (conn) => {
        conn.on('data', (data) => {
          const d = data as { type: string; name: string };
          if (d.type === 'caller-info') setRemoteName(d.name || 'مجهول');
        });
        dataConnRef.current = conn;
      });

      peerRef.current = peer;
    }, 100);

    // Timeout في حالة فشل الاتصال
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(loadingTimeout);
      peerRef.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myNumber]);

  // إجراء مكالمة
  const makeCall = useCallback(async (target: string) => {
    if (!peerRef.current || callStateRef.current !== 'idle') return;
    setError('');
    setCallState('calling');
    setRemoteNumber(target);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const targetId = `voicelink-${target}`;

      const dc = peerRef.current.connect(targetId);
      dataConnRef.current = dc;
      dc.on('open', () => { dc.send({ type: 'caller-info', name: myName || 'مجهول' }); });
      dc.on('data', (data) => {
        const d = data as { type: string; name: string };
        if (d.type === 'callee-info') setRemoteName(d.name || 'مجهول');
      });

      const call = peerRef.current.call(targetId, stream);
      callRef.current = call;

      call.on('stream', (rs: MediaStream) => {
        if (!remoteAudioRef.current) remoteAudioRef.current = new Audio();
        remoteAudioRef.current.srcObject = rs;
        remoteAudioRef.current.play().catch(() => {});
        setCallState('connected');
        startTimer();
      });

      call.on('close', () => {
        const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
        addLog({ name: remoteName || target, peerId: target, type: 'outgoing', duration: dur, timestamp: Date.now() });
        cleanup();
      });

      setTimeout(() => {
        if (callStateRef.current === 'calling') {
          addLog({ name: target, peerId: target, type: 'outgoing', duration: 0, timestamp: Date.now() });
          cleanup();
        }
      }, 30000);

    } catch {
      setError('يجب السماح بالوصول للميكروفون');
      setCallState('idle');
    }
  }, [myName, startTimer, addLog, cleanup, remoteName]);

  // الرد على مكالمة
  const answerCall = useCallback(async () => {
    if (!callRef.current) return;
    stopRingtone();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      callRef.current.answer(stream);
      if (dataConnRef.current) {
        try { dataConnRef.current.send({ type: 'callee-info', name: myName || 'مجهول' }); } catch {}
      }
      callRef.current.on('stream', (rs: MediaStream) => {
        if (!remoteAudioRef.current) remoteAudioRef.current = new Audio();
        remoteAudioRef.current.srcObject = rs;
        remoteAudioRef.current.play().catch(() => {});
        setCallState('connected');
        startTimer();
      });
      callRef.current.on('close', () => {
        const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
        addLog({ name: remoteName || remoteNumber, peerId: remoteNumber, type: 'incoming', duration: dur, timestamp: Date.now() });
        cleanup();
      });
    } catch {
      setError('يجب السماح بالوصول للميكروفون');
      cleanup();
    }
  }, [myName, remoteName, remoteNumber, stopRingtone, startTimer, addLog, cleanup]);

  // رفض المكالمة
  const rejectCall = useCallback(() => {
    stopRingtone();
    addLog({ name: remoteName || remoteNumber, peerId: remoteNumber, type: 'missed', duration: 0, timestamp: Date.now() });
    cleanup();
  }, [stopRingtone, addLog, remoteName, remoteNumber, cleanup]);

  // إنهاء المكالمة
  const hangUp = useCallback(() => {
    const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (callStateRef.current === 'connected') {
      addLog({ name: remoteName || remoteNumber, peerId: remoteNumber, type: 'outgoing', duration: dur, timestamp: Date.now() });
    }
    cleanup();
  }, [remoteName, remoteNumber, addLog, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeaker(p => !p);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeaker ? 0.5 : 1.0;
    }
  }, [isSpeaker]);

  return {
    myNumber, myName, updateMyName,
    callState, remoteName, remoteNumber, callDuration,
    isMuted, isSpeaker, isConnected, error, callLog,
    clearCallLog, makeCall, answerCall, rejectCall, hangUp,
    toggleMute, toggleSpeaker, setError, isLoading,
  };
}
