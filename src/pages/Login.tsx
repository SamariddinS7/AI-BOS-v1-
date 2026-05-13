import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          // Email confirmation is disabled, logged in automatically
          onLogin();
        } else {
          setError('Ro\'yxatdan o\'tdingiz! Iltimos email pochtangizni (Spam papkasini ham) tekshiring va tasdiqlang. Agar xat kelmasa Supabase sozlamalaridan "Confirm email" funksiyasini o\'chirib qo\'ying.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-surface-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col border border-border-dark">
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-600/30">
            <Bot className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-text-primary mb-2">Xush kelibsiz!</h1>
          <p className="text-text-muted text-base">AI-BOS tizimiga kirish uchun ma'lumotlaringizni kiriting</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 text-rose-500 text-rose-400 text-base rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-base font-medium text-text-primary block">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-ground border border-border-dark rounded-xl focus:bg-surface-dark focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-text-primary text-base"
                  placeholder="admin@ai-bos.uz"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-base font-medium text-text-primary block">Parol</label>
                <a href="#" className="text-base font-medium text-brand-500 dark:text-blue-400 hover:text-brand-400 hover:underline">Parolni unutdingizmi?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface-ground border border-border-dark rounded-xl focus:bg-surface-dark focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-text-primary text-base"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-base hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? "Ro'yxatdan o'tish" : "Kirish"} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 bg-surface-ground/50 border-t border-border-dark text-center">
          <p className="text-base text-text-muted">
            {isSignUp ? "Hisobingiz bormi?" : "Hisobingiz yo'qmi?"} {' '}
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-brand-500 dark:text-blue-400 font-bold hover:underline"
            >
              {isSignUp ? "Kirish" : "Ro'yxatdan o'tish"}
            </button>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center w-full z-10">
        <p className="text-text-muted text-base opacity-60">© 2026 AI-BOS Business Operating System</p>
      </div>
    </div>
  );
}
