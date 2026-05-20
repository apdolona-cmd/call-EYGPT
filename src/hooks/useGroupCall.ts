import { useState, useCallback, useRef, useEffect } from 'react';
import Peer from 'peerjs';
import type { CallState } from '../types';

interface GroupParticipant {
  peerId: string;
  phoneNumber: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
  connected: boolean;
  isMuted?: boolean;
}

interface GroupCallState {
  callState: CallState;
  participants: GroupParticipant[];
  myNumber: string;
  myName: string;
  myAvatar: string;
  groupCode: string;
  duration: number;
  isMuted: boolean;
  isConnected: boolean;
  error: string;
  isLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataMessage = { type: string; name?: string; avatar?: string; message?: string };

export function useGroupCall() {
  const [state, setState] = useState<GroupCallState>({
    callState: 'idle',
    participants: [],
    myNumber: '',
    myName: '',
    myAvatar: '',
    groupCode: '',
    duration: 0,
    isMuted: false,
    isConnected: false,
    error: '',
    isLoading: true,
  });

  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callRefsRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataConnRefRef = useRef<Map<string, any>>(new Map());
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const myNumber = localStorage.getItem('vl_num') || Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('vl_num', myNumber);
    const myName = localStorage.getItem('vl_name') || '';
    const myAvatar = localStorage.getItem('vl_avatar') || '';

    setState((prev: GroupCallState) => ({ ...prev, myNumber, myName, myAvatar }));

    const peerId = `voicelink-group-${myNumber}`;
    const peer = new Peer(peerId, { debug: 0 });

    peer.on('open', () => {
      setState((prev: GroupCallState) => ({ ...prev, isConnected: true, isLoading: false }));
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    peer.on('call', (incoming: any) => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) => {
        incoming.answer(stream);
        incoming.on('stream', (remoteStream: MediaStream) => {
          const remoteNumber = incoming.peer.replace('voicelink-group-', '');
          setState((prev: GroupCallState) => ({
            ...prev,
            participants: prev.participants.map((p: GroupParticipant) => 
              p.peerId === incoming.peer ? { ...p, stream: remoteStream, connected: true } : p
            ) || [{ peerId: incoming.peer, phoneNumber: remoteNumber, name: '', avatar: '', connected: true, stream: remoteStream }]
          }));
        });
        callRefsRef.current.set(incoming.peer, incoming);
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    peer.on('connection', (conn: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conn.on('data', (data: any) => {
        const d = data as DataMessage;
        if (d.type === 'participant-info') {
          const peerId = conn.peer;
          const number = peerId.replace('voicelink-group-', '');
          setState((prev: GroupCallState) => {
            const existing = prev.participants.find((p: GroupParticipant) => p.peerId === peerId);
            return {
              ...prev,
              participants: existing
                ? prev.participants.map((p: GroupParticipant) => 
                    p.peerId === peerId ? { ...p, name: d.name || p.name, avatar: d.avatar || p.avatar } : p
                  )
                : [...prev.participants, {
                    peerId,
                    phoneNumber: number,
                    name: d.name || 'مجهول',
                    avatar: d.avatar || '',
                    connected: true,
                  }]
            };
          });
        }
      });
      dataConnRefRef.current.set(conn.peer, conn);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    peer.on('error', (err: any) => {
      if (err.type === 'disconnected') {
        setState((prev: GroupCallState) => ({ ...prev, isConnected: false }));
        peer.reconnect();
      }
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const createGroup = useCallback(async () => {
    const groupCode = Math.random().toString(36).substring(7).toUpperCase();
    setState((prev: GroupCallState) => ({
      ...prev,
      groupCode,
      callState: 'calling',
    }));
    return groupCode;
  }, []);

  const joinGroup = useCallback(async (targetNumber: string) => {
    if (!peerRef.current || state.callState !== 'idle') return;

    setState((prev: GroupCallState) => ({ ...prev, callState: 'calling', error: '' }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const targetPeerId = `voicelink-group-${targetNumber}`;

      const dc = peerRef.current.connect(targetPeerId);
      dataConnRefRef.current.set(targetPeerId, dc);

      dc.on('open', () => {
        dc.send({
          type: 'participant-info',
          name: state.myName || 'مجهول',
          avatar: state.myAvatar,
        });
      });

      const call = peerRef.current.call(targetPeerId, stream);
      callRefsRef.current.set(targetPeerId, call);

      call.on('stream', (remoteStream: MediaStream) => {
        setState((prev: GroupCallState) => ({
          ...prev,
          participants: prev.participants.map((p: GroupParticipant) => 
            p.peerId === targetPeerId ? { ...p, stream: remoteStream, connected: true } : p
          ) || [{ peerId: targetPeerId, phoneNumber: targetNumber, name: '', avatar: '', stream: remoteStream, connected: true }]
        }));
      });

      call.on('close', () => {
        callRefsRef.current.delete(targetPeerId);
        setState((prev: GroupCallState) => ({
          ...prev,
          participants: prev.participants.filter((p: GroupParticipant) => p.peerId !== targetPeerId)
        }));
      });

      setState((prev: GroupCallState) => ({ ...prev, callState: 'connected' }));
      startTimeRef.current = Date.now();
      
      durationRef.current = setInterval(() => {
        setState((prev: GroupCallState) => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }, 1000);

    } catch (e) {
      setState((prev: GroupCallState) => ({
        ...prev,
        error: 'يجب السماح بالوصول للميكروفون',
        callState: 'idle'
      }));
    }
  }, [state.myName, state.myAvatar, state.callState]);

  const addParticipant = useCallback(async (targetNumber: string) => {
    if (!peerRef.current) return;

    try {
      const stream = localStreamRef.current || await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!localStreamRef.current) localStreamRef.current = stream;

      const targetPeerId = `voicelink-group-${targetNumber}`;

      const dc = peerRef.current.connect(targetPeerId);
      dataConnRefRef.current.set(targetPeerId, dc);

      dc.on('open', () => {
        dc.send({
          type: 'participant-info',
          name: state.myName || 'مجهول',
          avatar: state.myAvatar,
        });
      });

      const call = peerRef.current.call(targetPeerId, stream);
      callRefsRef.current.set(targetPeerId, call);

      call.on('stream', (remoteStream: MediaStream) => {
        setState((prev: GroupCallState) => ({
          ...prev,
          participants: prev.participants.map((p: GroupParticipant) => 
            p.peerId === targetPeerId ? { ...p, stream: remoteStream, connected: true } : p
          ) || [{ peerId: targetPeerId, phoneNumber: targetNumber, name: '', avatar: '', stream: remoteStream, connected: true }]
        }));
      });

      call.on('close', () => {
        callRefsRef.current.delete(targetPeerId);
        setState((prev: GroupCallState) => ({
          ...prev,
          participants: prev.participants.filter((p: GroupParticipant) => p.peerId !== targetPeerId)
        }));
      });

      setState((prev: GroupCallState) => ({
        ...prev,
        participants: [...prev.participants, {
          peerId: targetPeerId,
          phoneNumber: targetNumber,
          name: 'مجهول',
          avatar: '',
          connected: true,
        }]
      }));

    } catch (e) {
      setState((prev: GroupCallState) => ({
        ...prev,
        error: 'خطأ في إضافة المشارك'
      }));
    }
  }, [state.myName, state.myAvatar]);

  const endGroupCall = useCallback(() => {
    if (durationRef.current) {
      clearInterval(durationRef.current);
      durationRef.current = null;
    }

    callRefsRef.current.forEach((call: any) => {
      try {
        call.close();
      } catch {}
    });
    callRefsRef.current.clear();

    dataConnRefRef.current.forEach((conn: any) => {
      try {
        conn.close();
      } catch {}
    });
    dataConnRefRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      localStreamRef.current = null;
    }

    setState((prev: GroupCallState) => ({
      ...prev,
      callState: 'idle',
      participants: [],
      groupCode: '',
      duration: 0,
      isMuted: false,
    }));
  }, []);

  const removeParticipant = useCallback((peerId: string) => {
    const call = callRefsRef.current.get(peerId);
    if (call) {
      call.close();
      callRefsRef.current.delete(peerId);
    }

    const conn = dataConnRefRef.current.get(peerId);
    if (conn) {
      conn.close();
      dataConnRefRef.current.delete(peerId);
    }

    setState((prev: GroupCallState) => ({
      ...prev,
      participants: prev.participants.filter((p: GroupParticipant) => p.peerId !== peerId)
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setState((prev: GroupCallState) => ({ ...prev, isMuted: !track.enabled }));
      }
    }
  }, []);

  return {
    ...state,
    createGroup,
    joinGroup,
    addParticipant,
    endGroupCall,
    removeParticipant,
    toggleMute,
  };
}
