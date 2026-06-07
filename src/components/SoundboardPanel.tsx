import React from 'react';
import { useChatStore } from '../store';
import { Volume2, Sparkles, AlertCircle, VolumeX } from 'lucide-react';

interface SoundboardPanelProps {
  onClose: () => void;
}

export const SoundboardPanel: React.FC<SoundboardPanelProps> = ({ onClose }) => {
  const { sendMessage } = useChatStore();

  const playSynthSound = (sound: 'airhorn' | 'quack' | 'ding' | 'siren') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (sound === 'ding') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (sound === 'quack') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        
        osc1.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(480, audioCtx.currentTime + 0.08);
        
        osc2.frequency.setValueAtTime(325, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(485, audioCtx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.22);
        osc2.stop(audioCtx.currentTime + 0.22);
      } else if (sound === 'airhorn') {
        const duration = 0.6;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        const freqs = [196, 220, 392, 440];
        freqs.forEach((f) => {
          const osc = audioCtx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, audioCtx.currentTime);
          
          osc.frequency.linearRampToValueAtTime(f + 12, audioCtx.currentTime + 0.15);
          osc.frequency.linearRampToValueAtTime(f - 12, audioCtx.currentTime + 0.3);
          osc.frequency.linearRampToValueAtTime(f + 8, audioCtx.currentTime + 0.45);
          osc.frequency.linearRampToValueAtTime(f, audioCtx.currentTime + duration);
          
          osc.connect(gain);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        });
        gain.connect(audioCtx.destination);
      } else if (sound === 'siren') {
        const duration = 1.2;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        
        osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.9);
        osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + duration);
        
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }
    } catch (err) {
      console.error("Web Audio failed to initialize:", err);
    }
  };

  const handlePlaySound = (soundKey: 'airhorn' | 'quack' | 'ding' | 'siren', label: string, emoji: string) => {
    playSynthSound(soundKey);
    // Send a message in chat so other users know you triggered a sound
    sendMessage(`[Soundboard] Play sound: ${label} ${emoji}`, null);
  };

  const sounds = [
    { key: 'airhorn', label: 'Airhorn', emoji: '🎺', color: 'hover:bg-red-500/20 border-red-500/30 text-red-400' },
    { key: 'quack', label: 'Quack', emoji: '🦆', color: 'hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-400' },
    { key: 'ding', label: 'Ding chime', emoji: '🔔', color: 'hover:bg-blue-500/20 border-blue-500/30 text-blue-400' },
    { key: 'siren', label: 'Siren alert', emoji: '🚨', color: 'hover:bg-orange-500/20 border-orange-500/30 text-orange-400' },
  ] as const;

  return (
    <div className="absolute bottom-16 left-2 right-2 bg-[#1e1f22] border border-[#1f2023] rounded-lg shadow-xl p-3 z-40 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2b2d31]">
        <div className="flex items-center gap-1.5 text-white font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#5865f2]" /> Soundboard Synths
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] text-[#949ba4] hover:text-white uppercase font-bold"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sounds.map((sound) => (
          <button
            key={sound.key}
            onClick={() => handlePlaySound(sound.key, sound.label, sound.emoji)}
            className={`flex flex-col items-center justify-center p-2.5 rounded border bg-[#2b2d31] transition-all duration-150 text-left focus:outline-none ${sound.color}`}
          >
            <span className="text-xl mb-1">{sound.emoji}</span>
            <span className="text-[11px] font-bold truncate">{sound.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-[#949ba4] bg-[#2b2d31]/40 p-1.5 rounded">
        <AlertCircle className="w-3 h-3 text-[#5865f2] flex-shrink-0" />
        <span>Playing a synth logs it to the active channel feed!</span>
      </div>
    </div>
  );
};
