import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSwitchClick: () => void;
  playLampHum: () => void;
  playHeartPop: () => void;
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: true,
  toggleSound: () => {},
  playSwitchClick: () => {},
  playLampHum: () => {},
  playHeartPop: () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vyro_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('vyro_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  const getAudioContext = () => {
    let ctx = audioCtx;
    if (!ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        ctx = new AudioCtxClass();
        setAudioCtx(ctx);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Switch Click Sound (Procedural synthesis via Web Audio API)
  const playSwitchClick = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Lamp warm hum on wake
  const playLampHum = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Ignore
    }
  };

  // Pop sound for likes / interactions
  const playHeartPop = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore
    }
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSwitchClick, playLampHum, playHeartPop }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);

