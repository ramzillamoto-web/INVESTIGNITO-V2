import React, { useState } from 'react';
import {
  Shield,
  Key,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  LogOut,
  X,
  Send,
  Cloud,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { InvestignitoLogo } from './InvestignitoLogo';
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  clearUserSession,
  UserSession,
} from '../utils/playerAuth';

type AuthMode = 'login' | 'register' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentSession: UserSession | null;
  onAuthSuccess: (session: UserSession, cloudProgress?: any) => void;
  onLogout: () => void;
  currentProgress?: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onAuthSuccess,
  onLogout,
  currentProgress,
}) => {
  const [mode, setMode] = useState<AuthMode>('register'); // Defaults to register so new visitors land right on registration

  // Form Fields (strictly space-free)
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recoveryHint, setRecoveryHint] = useState<string | null>(null);

  if (!isOpen) return null;

  // The modal is strictly non-dismissible when user is NOT logged in
  const isForced = !currentSession;

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecoveryHint(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Case-insensitive & spaces stripped
    const cleanId = loginIdentifier.replace(/\s+/g, '').toLowerCase().trim();
    const cleanPass = password.replace(/\s+/g, '').toLowerCase().trim();

    if (!cleanId) {
      setErrorMessage('Please enter your Call Sign or Email.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(cleanId, cleanPass);
      if (res.success && res.username) {
        setSuccessMessage('Dossier verified! Synchronizing investigation data...');
        setTimeout(() => {
          onAuthSuccess(
            {
              username: res.username!,
              email: res.email || '',
              password: cleanPass,
            },
            res.progressData
          );
          if (onClose) onClose();
        }, 800);
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Case-insensitive & spaces stripped
    const cleanEmail = email.replace(/\s+/g, '').toLowerCase().trim();
    const cleanUser = username.replace(/\s+/g, '').toLowerCase().trim();
    const cleanPass = password.replace(/\s+/g, '').toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please provide a valid official email address.');
      return;
    }

    if (cleanUser.length < 3) {
      setErrorMessage('Call Sign / Username must be at least 3 characters.');
      return;
    }

    if (cleanPass.length < 4) {
      setErrorMessage('Case Key / Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser(cleanEmail, cleanUser, cleanPass, currentProgress);
      if (res.success && res.username) {
        setSuccessMessage('Detective badge issued! Case progress saved to cloud.');
        setTimeout(() => {
          onAuthSuccess(
            {
              username: res.username!,
              email: cleanEmail,
              password: cleanPass,
            },
            currentProgress
          );
          if (onClose) onClose();
        }, 900);
      } else {
        setErrorMessage(res.message || 'Registration failed. Call sign or email may already be in use.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecoveryHint(null);

    const cleanEmail = email.replace(/\s+/g, '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter the email associated with your dossier.');
      return;
    }

    setLoading(true);

    try {
      const res = await requestPasswordReset(cleanEmail);
      if (res.success) {
        setSuccessMessage(res.message || `Password recovery transmission dispatched to ${cleanEmail}.`);
        if ((res as any).hint) {
          setRecoveryHint((res as any).hint);
        }
      } else {
        setErrorMessage(res.message || 'No registered detective found with that email address.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAction = () => {
    clearUserSession();
    onLogout();
    setMode('login');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detective Authentication"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg animate-fade-in overflow-y-auto"
      onClick={() => {
        // Non-dismissible if unauthenticated
        if (!isForced && onClose) {
          onClose();
        }
      }}
    >
      {/* Modal Dialog Card */}
      <div
        className="bg-[#0b0b10] border-2 border-red-600/80 rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative text-neutral-100 my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(220, 38, 38, 0.35)',
        }}
      >
        {/* Top Close Button (ONLY enabled when user is already authenticated and inspecting their profile) */}
        {!isForced && onClose && (
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* View 1: User Already Authenticated (Profile View) */}
        {currentSession ? (
          <div className="space-y-5 text-center">
            {currentSession.isMaster || currentSession.username?.toLowerCase() === 'ramazan' ? (
              <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-950/60">
                <Key className="w-8 h-8 text-amber-400" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/60">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
            )}

            <div>
              {currentSession.isMaster || currentSession.username?.toLowerCase() === 'ramazan' ? (
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block mb-1">
                  ★ MASTER DETECTIVE • ALL CASES UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  AUTHENTICATED DETECTIVE
                </span>
              )}
              <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white">
                {currentSession.username}
              </h2>
              {currentSession.email && (
                <p className="text-xs font-mono text-neutral-400 mt-0.5">{currentSession.email}</p>
              )}
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-xs font-mono text-emerald-300">
                <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Cloud Auto-Save Active</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              Your case files, suspect eliminations, and forensic notes automatically synchronize to your detective account every 5 seconds.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLogoutAction}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-red-600/70 text-red-300 hover:text-red-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of this Terminal</span>
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Return to Investigation
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Authentication Views (Forced Overlay) */
          <>
            {/* Bureau Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-red-600/50 flex items-center justify-center p-2 shadow-inner shrink-0">
                <InvestignitoLogo size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-500 block">
                    BUREAU AUTHENTICATION
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-950/80 border border-red-700/60 text-red-300 font-bold">
                    REQUIRED
                  </span>
                </div>
                <h2 className="text-xl font-black font-display uppercase tracking-tight text-white leading-tight">
                  {mode === 'login' && 'Detective Login'}
                  {mode === 'register' && 'Detective Enlistment'}
                  {mode === 'forgot_password' && 'Password Recovery'}
                </h2>
              </div>
            </div>

            {/* Mode Switcher Tabs with Prominent Glowing Electric Cyan Register Tab */}
            {mode !== 'forgot_password' && (
              <div className="flex items-center gap-2 mb-5 p-1 rounded-xl bg-neutral-950/90 border border-neutral-800">
                {/* REGISTER Tab (Prominent, High-Visibility, Glowing Electric Cyan) */}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className={`flex-[1.2] py-2.5 px-3 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98] ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 text-neutral-950 border-2 border-white'
                      : 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border-2 border-cyan-400/80'
                  }`}
                  style={{
                    boxShadow: mode === 'register'
                      ? '0 0 18px rgba(0, 240, 255, 0.75), 0 0 35px rgba(0, 240, 255, 0.4)'
                      : '0 0 12px rgba(0, 240, 255, 0.45)',
                  }}
                >
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${mode === 'register' ? 'text-neutral-950 animate-pulse' : 'text-cyan-300'}`} />
                  <span className="text-[12px] font-black">REGISTER BADGE</span>
                </button>

                {/* LOG IN Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                    mode === 'login'
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-400'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Log In</span>
                </button>
              </div>
            )}

            {/* Mode 1: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-identifier"
                      className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
                    >
                      Call Sign or Email
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">No spaces • Case-insensitive</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="login-identifier"
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Username or detective@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm font-mono placeholder:text-neutral-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
                    >
                      Case Key / Password
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot_password')}
                      className="text-[11px] text-red-400 hover:text-red-300 font-mono underline transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm font-mono placeholder:text-neutral-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline Errors & Successes */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-600 text-red-200 text-xs font-mono flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-start gap-2.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{successMessage}</span>
                  </div>
                )}

                {/* Main Submit: LOG IN & SYNC with glowing tactical red box shadow */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  style={{
                    boxShadow: '0 0 20px rgba(220, 38, 38, 0.7), 0 0 35px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Log In & Sync Dossier</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode 2: REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Purchase Email Notice Banner */}
                <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800/70 flex items-center gap-2 text-cyan-200 text-xs font-mono">
                  <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Use the email you used to purchase the game.</span>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="reg-email"
                      className="block text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300"
                    >
                      Purchase Email
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">Must match your game order</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Email used to buy the game"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm font-mono placeholder:text-neutral-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Call Sign / Username */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="reg-username"
                      className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
                    >
                      Detective Call Sign / Username
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">No spaces • Case-insensitive</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-username"
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. AgentVane"
                      maxLength={32}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm font-mono placeholder:text-neutral-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="reg-password"
                      className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
                    >
                      Case Key / Password
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">No spaces • Case-insensitive</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Min 4 characters (e.g. clue123)"
                      className="w-full pl-10 pr-10 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm font-mono placeholder:text-neutral-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline Errors & Successes */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-600 text-red-200 text-xs font-mono flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-start gap-2.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{successMessage}</span>
                  </div>
                )}

                {/* Main Submit: ISSUE BADGE with glowing electric cyan box shadow */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-neutral-950 text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] border border-cyan-200"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.75), 0 0 40px rgba(0, 240, 255, 0.4)',
                  }}
                >
                  {loading ? (
                    <span>Registering Badge...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-neutral-950" />
                      <span className="tracking-widest">ISSUE BADGE & AUTO-SAVE</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode 3: FORGOT_PASSWORD */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Enter your registered detective email. The bureau will dispatch password recovery information to restore access to your dossier.
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="reset-email"
                      className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
                    >
                      Registered Email
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">No spaces</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}
                      placeholder="detective@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white text-sm font-mono placeholder:text-neutral-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Inline Errors & Successes */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-600 text-red-200 text-xs font-mono flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-mono flex flex-col gap-1.5 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{successMessage}</span>
                    </div>
                    {recoveryHint && (
                      <span className="text-[11px] font-mono text-emerald-300 pl-6.5 font-bold">
                        {recoveryHint}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  style={{
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.7)',
                  }}
                >
                  {loading ? (
                    <span>Dispatching...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-neutral-950" />
                      <span>Send Recovery Transmission</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs text-neutral-400 hover:text-white font-mono underline transition-colors cursor-pointer"
                  >
                    Return to Detective Login
                  </button>
                </div>
              </form>
            )}

            {/* Non-dismissible lock footnote */}
            <div className="pt-4 mt-2 border-t border-neutral-800/80 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                <Lock className="w-3 h-3 text-red-500/80" />
                <span>Authentication Required to Unlock Dossier</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
