import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Eye, EyeOff, Sparkles, ArrowDown, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface InteractiveLumenLampProps {
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const InteractiveLumenLamp: React.FC<InteractiveLumenLampProps> = ({ onSuccess }) => {
  const { soundEnabled, toggleSound, playSwitchClick, playLampHum } = useSound();
  const { login: setAuthUser } = useAuth();

  // 1. KONDISI AWAL WAJIB MATI (OFF)
  const [isOn, setIsOn] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [cordStretch, setCordStretch] = useState<number>(0);

  // Form states
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // 2. AUTENTIFIKASI PENGGUNA MANUSIA (Human Verification)
  const [isHumanVerified, setIsHumanVerified] = useState<boolean>(false);
  const [isVerifyingHuman, setIsVerifyingHuman] = useState<boolean>(false);

  // Form inputs
  const [loginIdentifier, setLoginIdentifier] = useState<string>('admin@vyro.ai');
  const [password, setPassword] = useState<string>('Admin123!');
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'USER' | 'CREATOR'>('CREATOR');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  // Ambient floating dust particles
  const particles = Array.from({ length: 16 });

  // Handle pull cord interaction with elastic spring physics
  const handleCordPull = () => {
    setIsPulling(true);
    setCordStretch(26);

    setTimeout(() => {
      setCordStretch(0);
      setIsPulling(false);
      playSwitchClick();

      setIsOn((prev) => {
        const nextState = !prev;
        if (nextState) {
          playLampHum();
        }
        return nextState;
      });
    }, 180);
  };

  // Human verification toggle handler
  const handleHumanVerification = () => {
    if (isHumanVerified || isVerifyingHuman) return;
    setIsVerifyingHuman(true);
    setTimeout(() => {
      setIsVerifyingHuman(false);
      setIsHumanVerified(true);
    }, 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isHumanVerified) {
      setErrorMessage('Harap lakukan Verifikasi Pengguna Manusia terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        login: loginIdentifier,
        password,
        rememberMe,
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuthUser(user, accessToken, refreshToken);
        setSuccessMessage('Welcome back! Entering VYRO AI...');
        if (onSuccess) {
          setTimeout(onSuccess, 500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isHumanVerified) {
      setErrorMessage('Harap lakukan Verifikasi Pengguna Manusia terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName,
        username,
        email,
        password,
        role,
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuthUser(user, accessToken, refreshToken);
        setSuccessMessage('Akun berhasil dibuat! Masuk ke VYRO AI...');
        if (onSuccess) {
          setTimeout(onSuccess, 500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Registrasi gagal. Periksa kembali form Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSuccessMessage('Token reset password telah dibuat.');
        if (response.data.resetToken) {
          setResetToken(response.data.resetToken);
          setMode('reset');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Gagal mengirim token reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      if (response.data.success) {
        setSuccessMessage('Password berhasil diupdate! Silakan login.');
        setTimeout(() => setMode('login'), 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Token tidak valid atau expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-screen overflow-x-hidden overflow-y-auto bg-[#080604] flex flex-col justify-between items-center select-none py-4 px-3 sm:px-4">
      {/* 1. KABEL DARI LANGIT-LANGIT (MENEMBUS ATAS SCREEN) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <motion.div
          animate={{
            height: isOn ? '75px' : 'calc(45vh - 75px)',
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 25 }}
          className="w-[2.5px] bg-gradient-to-b from-[#111111] via-[#292524] to-[#44403c] rounded-full mx-auto shadow-md"
        />
      </div>

      {/* Dynamic Ambient Background Glow ketika Lampu Hidup */}
      <AnimatePresence>
        {isOn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full z-0"
            style={{
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.1) 45%, rgba(0, 0, 0, 0) 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Ambient Sparks / Dust Motes */}
      {isOn && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
          {particles.map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                y: Math.random() * 300 + 80,
                opacity: 0,
                scale: Math.random() * 0.7 + 0.3,
              }}
              animate={{
                y: [null, Math.random() * -120 - 40],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 3.5,
                repeat: Infinity,
                delay: Math.random() * 2.5,
                ease: 'easeInOut',
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]"
            />
          ))}
        </div>
      )}

      {/* 2. AREA TENGAH: LAMPU DAN FORMULIR */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
        className="relative z-20 flex flex-col items-center w-full max-w-[370px] my-auto"
      >
        {/* HANGING LAMP FIXTURE (Desain Asli Sesuai Video Referensi) */}
        <div className="flex flex-col items-center shrink-0">
          {/* Socket Cap */}
          <div className="w-10 h-3.5 bg-[#262626] rounded-t-lg border-t border-[#404040] shadow-inner" />

          {/* Bulb Body (Ukuran Pas Sesuai Video: 90px x 105px) */}
          <motion.div
            animate={{
              y: [0, -2, 0],
              rotate: [0, 0.3, -0.3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative flex items-center justify-center cursor-pointer select-none"
            onClick={handleCordPull}
            title="Tarik kabel saklar untuk menyalakan lampu"
          >
            {/* The Bulb Contour */}
            <div
              className={`relative w-[92px] h-[106px] rounded-t-full rounded-b-[42%_42%] flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
                isOn
                  ? 'bg-gradient-to-b from-[#FFFDF2] via-[#FEE894] to-[#F59E0B] shadow-[0_0_55px_15px_rgba(245,158,11,0.55)] border-2 border-amber-200/90'
                  : 'bg-gradient-to-b from-[#78716c] to-[#44403c] shadow-[0_12px_24px_rgba(0,0,0,0.85)] border border-[#57534e]'
              }`}
            >
              {/* Sleeping Face: - - dengan "z Z z" */}
              {!isOn ? (
                <div className="relative flex flex-col items-center select-none">
                  {/* Closed horizontal line eyes */}
                  <div className="flex gap-4 items-center">
                    <div className="w-3.5 h-[2px] bg-[#1c1917] rounded-full" />
                    <div className="w-3.5 h-[2px] bg-[#1c1917] rounded-full" />
                  </div>
                  {/* Sleepy mouth */}
                  <div className="w-1.5 h-[2px] bg-[#1c1917] rounded-full mt-2 opacity-60" />

                  {/* Floating "z Z" */}
                  <div className="absolute -top-4 -right-6 flex flex-col items-start pointer-events-none text-[#a8a29e] font-bold">
                    <motion.span
                      animate={{ y: [-1, -8], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      className="text-[10px]"
                    >
                      z
                    </motion.span>
                    <motion.span
                      animate={{ y: [-1, -10], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.3, repeat: Infinity, delay: 0.5, ease: 'easeOut' }}
                      className="text-[12px] ml-2"
                    >
                      Z
                    </motion.span>
                  </div>
                </div>
              ) : (
                /* Awake Happy Face: ^ ^ + Rosy Blush + Gentle Smile */
                <div className="relative flex flex-col items-center select-none">
                  {/* Happy Crescent Eyes */}
                  <div className="flex gap-4 items-center">
                    <div className="w-3.5 h-2 border-t-2 border-l border-r border-[#78350f] rounded-t-full" />
                    <div className="w-3.5 h-2 border-t-2 border-l border-r border-[#78350f] rounded-t-full" />
                  </div>

                  {/* Blushing Cheeks & Smile */}
                  <div className="relative flex items-center justify-center mt-1.5 w-14">
                    <div className="absolute left-0 w-3 h-1.5 bg-rose-400/80 rounded-full blur-[0.5px]" />
                    <div className="w-3.5 h-2 border-b-2 border-[#78350f] rounded-b-full" />
                    <div className="absolute right-0 w-3 h-1.5 bg-rose-400/80 rounded-full blur-[0.5px]" />
                  </div>
                </div>
              )}
            </div>

            {/* Pull Cord hanging below the bulb */}
            <div
              className="absolute top-[100%] flex flex-col items-center cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                handleCordPull();
              }}
            >
              {/* Beaded String */}
              <motion.div
                animate={{ height: (isOn ? 26 : 40) + cordStretch }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="w-[2px] bg-gradient-to-b from-[#78716c] to-[#d97706] flex flex-col items-center justify-between"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
              </motion.div>

              {/* Golden Bead Switch Bead */}
              <motion.div
                animate={{ y: cordStretch, scale: isPulling ? 1.25 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="relative w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-md border border-amber-300 group-hover:scale-110 active:scale-95 transition-transform"
              >
                {/* Petunjuk "pull" dengan panah (Tampil hanya saat lampu mati) */}
                {!isOn && (
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#a8a29e] tracking-wider pointer-events-none whitespace-nowrap animate-pulse font-medium">
                    <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>pull</span>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* AUTHENTICATION FORM CARD (MUNCUL DI BAWAH LAMPU DENGAN PRESISI) */}
        <AnimatePresence>
          {isOn && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full mt-3 glass-panel-glow rounded-[26px] p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl border border-amber-500/25 shrink-0"
            >
              {/* Header Card */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-[0_0_12px_#f59e0b] flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-[#18120c]" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1">
                    VYRO <span className="text-amber-400">AI</span>
                  </h1>
                </div>
                <p className="text-xs text-[#A3998F]">
                  {mode === 'login' && "Welcome back — the light's on for you."}
                  {mode === 'register' && 'Join the next-gen AI video universe.'}
                  {mode === 'forgot' && 'Reset your password effortlessly.'}
                  {mode === 'reset' && 'Create your fresh, secure password.'}
                </p>
              </div>

              {/* Status Alerts */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Email or username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A3998F] hover:text-amber-400 font-medium transition-colors flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>

                  {/* 🛡️ AUTENTIFIKASI PENGGUNA MANUSIA WIDGET */}
                  <div
                    onClick={handleHumanVerification}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                      isHumanVerified
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/[0.03] border-white/10 hover:border-amber-500/40 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isHumanVerified
                            ? 'bg-emerald-500 border-emerald-400 text-stone-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'bg-black/40 border-white/20'
                        }`}
                      >
                        {isVerifyingHuman ? (
                          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : isHumanVerified ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : null}
                      </div>
                      <span className="text-xs font-medium">
                        {isVerifyingHuman
                          ? 'Memverifikasi...'
                          : isHumanVerified
                          ? 'Pengguna Manusia Terverifikasi'
                          : 'Verifikasi Pengguna Manusia'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Security</span>
                    </div>
                  </div>

                  {/* Options row: Remember Me & Forgot */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-[#A3998F] hover:text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-[#130F0B] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('forgot');
                      }}
                      className="text-[#A3998F] hover:text-amber-400 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-[#18120C] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_22px_rgba(245,158,11,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sign in</span>}
                  </button>

                  {/* Demo fill button */}
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('admin@vyro.ai');
                        setPassword('Admin123!');
                        setIsHumanVerified(true);
                      }}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors underline cursor-pointer"
                    >
                      Demo Admin (admin@vyro.ai / Admin123!)
                    </button>
                  </div>

                  {/* Toggle to Register */}
                  <div className="pt-2 text-center border-t border-white/5">
                    <span className="text-xs text-[#6B635B] mr-1">new here?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('register');
                      }}
                      className="text-xs font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      Create an account
                    </button>
                  </div>
                </form>
              )}

              {/* 2. REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Username (e.g. creator_mark)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min. 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400 pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#A3998F] hover:text-amber-400"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('CREATOR')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        role === 'CREATOR'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-stone-400'
                      }`}
                    >
                      🎬 Creator
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('USER')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        role === 'USER'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-stone-400'
                      }`}
                    >
                      👀 Viewer / User
                    </button>
                  </div>

                  {/* Human Verification */}
                  <div
                    onClick={handleHumanVerification}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                      isHumanVerified
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/[0.03] border-white/10 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isHumanVerified ? 'bg-emerald-500 border-emerald-400 text-stone-950' : 'bg-black/40 border-white/20'
                        }`}
                      >
                        {isHumanVerified && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-medium">
                        {isHumanVerified ? 'Pengguna Manusia Terverifikasi' : 'Verifikasi Pengguna Manusia'}
                      </span>
                    </div>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 py-2.5 px-4 rounded-xl font-bold text-xs text-[#18120C] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Create Account</span>}
                  </button>

                  <div className="pt-2 text-center border-t border-white/5">
                    <span className="text-xs text-[#6B635B] mr-1">already registered?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('login');
                      }}
                      className="text-xs font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              )}

              {/* 3. FORGOT PASSWORD */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <p className="text-xs text-[#A3998F]">
                    Masukkan email akun untuk mendapatkan token pemulihan password.
                  </p>
                  <div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-[#18120C] bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send Reset Token</span>}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-[#A3998F] hover:text-white transition-colors"
                    >
                      Back to Sign in
                    </button>
                  </div>
                </form>
              )}

              {/* 4. RESET PASSWORD */}
              {mode === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <input
                      type="password"
                      placeholder="Password baru (min. 6 karakter)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140F0A]/90 border border-white/10 text-white placeholder-[#6B635B] text-xs focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-[#18120C] bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Update Password</span>}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. FOOTER: TAGLINE BRAND & SOUND TOGGLE PILL (PERSIS SEPERTI VIDEO REFERENSI) */}
      <div className="relative z-30 w-full max-w-4xl flex items-center justify-between text-xs text-[#A3998F] px-4 shrink-0">
        <div className="flex flex-col">
          <span className="font-bold text-white text-xs tracking-wide">VYRO AI</span>
          <span className="text-[11px] text-[#78716c]">pull the cord — the light's on for you</span>
        </div>

        <button
          onClick={toggleSound}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#d6d3d1] transition-all cursor-pointer select-none"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>sound on</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
              <span>sound off</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
