// src/services/useOpenAiRtc.ts
import { useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Conditional import for WebRTC to handle platform differences
let RTCPeerConnection: any;
let RTCSessionDescription: any;
let mediaDevices: any;

try {
  const webrtc = require('react-native-webrtc');
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCSessionDescription = webrtc.RTCSessionDescription;
  mediaDevices = webrtc.mediaDevices;
  console.log('WebRTC loaded successfully');
} catch (error) {
  console.warn('WebRTC not available:', error.message);
  // Fallback implementations for development
  RTCPeerConnection = class MockRTC {
    constructor() { 
      console.log('Mock RTC PeerConnection created');
      this.iceConnectionState = 'connected';
      this.localDescription = { sdp: 'mock-sdp' };
    }
    close() { console.log('Mock RTC closed'); }
    createOffer() { 
      return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' }); 
    }
    setLocalDescription() { return Promise.resolve(); }
    setRemoteDescription() { return Promise.resolve(); }
    addTrack() { return {}; }
    get ondatachannel() { return null; }
    set ondatachannel(fn) { console.log('Mock ondatachannel set'); }
    get ontrack() { return null; }
    set ontrack(fn) { console.log('Mock ontrack set'); }
    get oniceconnectionstatechange() { return null; }
    set oniceconnectionstatechange(fn) { console.log('Mock oniceconnectionstatechange set'); }
  };
  RTCSessionDescription = class MockRTCSessionDescription {
    constructor(desc: any) { console.log('Mock RTCSessionDescription created:', desc); }
  };
  mediaDevices = {
    getUserMedia: () => Promise.resolve({
      getTracks: () => [],
      addTrack: () => {},
    })
  };
}

export type Status = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SessionResponse {
  client_secret: { value: string; expires_at: string };
  session_id: string;
  expires_at: string;
}

const MODEL_ID = 'gpt-4o-realtime-preview-2025-06-03';
const EDGE_URL =
  'https://wcdyuqrbkxkzbbwpxmow.supabase.co/functions/v1/create-realtime-session';

export function useOpenAiRtc() {
  const [status, setStatus] = useState<Status>('disconnected');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const onServerEvent = useRef<(e: any) => void>();
  const clientSecretRef = useRef<string | null>(null);

  /* ------------------------------------------------------------------ *
   *  CONNECT                                                            *
   * ------------------------------------------------------------------ */
  const connect = useCallback(async () => {
    setStatus('connecting');
    try {
      // Check if we're using mock WebRTC (development mode)
      if (RTCPeerConnection.name === 'MockRTC' || Platform.OS === 'web') {
        console.log('Using mock WebRTC - simulating connection');
        setStatus('connected');
        return;
      }

      /* 1 ▸ fetch session from Edge Function */
      const jwt = await safeGetSupabaseJwt();
      const hdrs: Record<string, string> = { 'Content-Type': 'application/json' };
      if (jwt) hdrs.Authorization = `Bearer ${jwt}`;

      const res = await fetch(EDGE_URL, { method: 'POST', headers: hdrs });
      if (!res.ok) throw new Error(`Session fetch failed: ${await res.text()}`);
      const session: SessionResponse = await res.json();
      clientSecretRef.current = session.client_secret.value;

      /* 2 ▸ create peer connection */
      const pc = new RTCPeerConnection(); // Google STUN by default
      pcRef.current = pc;

      /* 3 ▸ DataChannel + tracks */
      pc.ondatachannel = (ev: RTCDataChannelEvent) => {
        if (ev.channel.label === 'oai-events') {
          dataChannelRef.current = ev.channel;
          ev.channel.onopen = () => console.log('[RTC] data channel open');
          ev.channel.onmessage = (e) => onServerEvent.current?.(JSON.parse(e.data));
        }
      };

      pc.ontrack = (ev: RTCTrackEvent) => {
        if (ev.streams[0]) {
          audioStreamRef.current = ev.streams[0];
          console.log('[RTC] remote audio stream ready');
        }
      };

      pc.oniceconnectionstatechange = () => {
        const s: RTCIceConnectionState = pc.iceConnectionState;
        if (s === 'connected') setStatus('connected');
        else if (s === 'failed') setStatus('error');
      };

      /* 4 ▸ add mic track */
      const local = await mediaDevices.getUserMedia({ audio: true });
      local.getTracks().forEach((t) => pc.addTrack(t, local));

      /* 5 ▸ create offer */
      await pc.setLocalDescription(await pc.createOffer());
      if (!pc.localDescription?.sdp)
        throw new Error('localDescription is null after createOffer');

      /* 6 ▸ POST offer, get answer */
      const answerSdp = await fetch(
        `https://api.openai.com/v1/realtime?model=${MODEL_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecretRef.current}`,
            'Content-Type': 'application/sdp',
            'OpenAI-Beta': 'realtime=v1',
          },
          body: pc.localDescription.sdp,
        },
      ).then((r) => r.text());

      /* 7 ▸ finish handshake */
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: answerSdp }),
      );
    } catch (err) {
      console.error('[OpenAI‑RTC] connect error', err);
      setStatus('error');
      throw err;
    }
  }, []);

  /* ------------------------------------------------------------------ *
   *  AUDIO STREAMING helpers (skeleton)                                 *
   * ------------------------------------------------------------------ */
  const startRecording = useCallback(() => {
    // Implement PCM16 → base64 streaming and send via dataChannelRef.current
  }, []);

  const stopRecording = useCallback(() => {
    dataChannelRef.current?.send(
      JSON.stringify({ type: 'input_audio_buffer.commit' }),
    );
  }, []);

  /* ------------------------------------------------------------------ *
   *  MISC                                                               *
   * ------------------------------------------------------------------ */
  const close = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    setStatus('disconnected');
  }, []);

  const sendEvent = useCallback((e: object) => {
    dataChannelRef.current?.send(JSON.stringify(e));
  }, []);

  const onEvent = useCallback((cb: (e: any) => void) => {
    onServerEvent.current = cb;
  }, []);

  return { connect, startRecording, stopRecording, close, status, sendEvent, onEvent };
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  Helpers                                                                    *
 * ──────────────────────────────────────────────────────────────────────────── */
async function safeGetSupabaseJwt(): Promise<string | null> {
  try {
    return await getSupabaseJwt();
  } catch {
    return null;
  }
}

/* Get Supabase JWT from current session */
async function getSupabaseJwt(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session');
  }
  return session.access_token;
}