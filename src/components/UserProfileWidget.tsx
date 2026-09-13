import React, { useState } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { LogIn, LogOut, CloudCheck, Cloud, Loader2 } from 'lucide-react';

export default function UserProfileWidget() {
  const { user, loginWithGoogle, logout, isSynced, loadingAuth } = usePlanner();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setErrorMessage(null);
      setIsLoggingIn(true);
      const res = await loginWithGoogle();
      if (!res) {
        setErrorMessage('Tizimga kirish bekor qilindi yoki oyna yopildi.');
      }
    } catch (err: any) {
      console.error('Login error detail:', err);
      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Pop-up oyna brauzer tomonidan bloklandi. Iltimos brauzerda pop-up ruxsat bering.');
      } else if (err?.code === 'auth/auth-domain-config-required') {
        setErrorMessage('Auth domen sozlanmagan.');
      } else {
        setErrorMessage(err?.message || 'Google orqali kirishda xatolik yuz berdi. Ilovani yangi oynada ochib ko\'ring.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isGoogleUser = user && !user.isAnonymous;

  return (
    <div className="glass-card p-3 rounded-2xl border border-white/10 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {user ? (
            isSynced ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CloudCheck size={14} /> Bulutga ulangan
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Cloud size={14} /> Sinxronlanmoqda...
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-stone-400">
              <Cloud size={14} /> Mahalliy rejim
            </span>
          )}
        </div>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {loadingAuth ? (
        <div className="flex items-center justify-center py-2 text-stone-400 text-xs gap-2">
          <Loader2 size={14} className="animate-spin" /> Yukonmoqda...
        </div>
      ) : isGoogleUser ? (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-white/20 flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.displayName || 'Foydalanuvchi'}</p>
              <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            title="Chiqish"
          >
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-2 px-3 glass-button-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google orqali kirish (Sync)
              </>
            )}
          </button>
          {errorMessage && (
            <p className="text-[11px] text-amber-300/90 leading-tight bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
