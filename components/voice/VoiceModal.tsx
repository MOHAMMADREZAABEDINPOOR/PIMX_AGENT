'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { X, Mic, MicOff, Send, Sparkles } from 'lucide-react';
import {UiText} from '@/components/i18n/LocaleProvider';

export function VoiceModal() {
  const { voiceModalOpen, setVoiceModalOpen, sendMessage } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [bars, setBars] = useState<number[]>(() => new Array(28).fill(15));
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    } else {
      setIsListening(true);
    }

    // Animate 28 waveform bars
    const updateWaveform = () => {
      setBars((prev) =>
        prev.map(() => Math.floor(Math.random() * 65) + 15)
      );
      animFrameRef.current = requestAnimationFrame(updateWaveform);
    };
    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  if (!voiceModalOpen) return null;

  const handleSend = () => {
    if (transcript.trim()) {
      sendMessage(transcript.trim());
    }
    stopListening();
    setTranscript('');
    setVoiceModalOpen(false);
  };

  const handleClose = () => {
    stopListening();
    setTranscript('');
    setVoiceModalOpen(false);
  };

  return (
    <div
      id="voice-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col items-center p-6 space-y-6 text-center animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <Sparkles className="w-4 h-4 text-accent" />
            <span><UiText source={"Real-time Voice Input"}/></span>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pulsing Mic Avatar */}
        <div className="relative flex items-center justify-center py-4">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening ? 'scale-110 shadow-lg' : 'opacity-80 scale-100'
            }`}
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            {isListening ? (
              <Mic className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <MicOff className="w-10 h-10 text-white/70" />
            )}
          </div>
        </div>

        {/* 28 Dynamic Waveform Bars */}
        <div className="flex items-end justify-center gap-1 h-16 w-full px-4">
          {bars.map((height, idx) => (
            <div
              key={idx}
              className="w-1.5 rounded-full transition-all duration-100"
              style={{
                height: isListening ? `${height}%` : '8%',
                backgroundColor: 'var(--accent-color)',
                opacity: isListening ? 0.85 : 0.25,
              }}
            />
          ))}
        </div>

        {/* Live Transcript Display */}
        <div
          className="w-full min-h-[72px] p-3 rounded-2xl border text-xs text-left overflow-y-auto max-h-32"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-color)',
          }}
        >
          {transcript ? (
            <p className="leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-muted italic text-center py-4">
              {isListening ? <UiText source={"Listening... Speak your prompt naturally."}/> : <UiText source={"Click \"Start Recording\" to begin speaking."}/>}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 font-medium text-xs text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
          >
            {isListening ? <UiText source={"Pause Recording"}/> : <UiText source={"Start Recording"}/>}
          </button>
          <button
            onClick={handleSend}
            disabled={!transcript.trim()}
            className="flex-1 py-2.5 rounded-xl font-medium text-xs text-white shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <Send className="w-3.5 h-3.5" />
            <span><UiText source={"Send to Model"}/></span>
          </button>
        </div>
      </div>
    </div>
  );
}
