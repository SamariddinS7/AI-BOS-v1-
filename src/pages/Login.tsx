import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      if (email === 'admin@ai-bos.uz' && password === 'admin123') {
        onLogin();
      } else {
        setError("Email yoki parol noto'g'ri");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col border dark:border-gray-800">
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
            <Bot className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Xush kelibsiz!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">AI-BOS tizimiga kirish uchun ma'lumotlaringizni kiriting</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-base rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-base font-medium text-gray-700 dark:text-gray-300 block">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all dark:text-gray-100 text-base"
                  placeholder="admin@ai-bos.uz"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-base font-medium text-gray-700 dark:text-gray-300 block">Parol</label>
                <a href="#" className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">Parolni unutdingizmi?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all dark:text-gray-100 text-base"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Kirish <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-base">yoki</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            <button 
              type="button"
              onClick={onLogin}
              className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold text-base hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-800 transition-all flex items-center justify-center gap-2"
            >
              Sinov davri uchun kirish
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-base text-gray-500 dark:text-gray-400">
            Hisobingiz yo'qmi? <a href="#" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Ro'yxatdan o'tish</a>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center w-full z-10">
        <p className="text-gray-500 dark:text-gray-400 text-base opacity-60">© 2026 AI-BOS Business Operating System</p>
      </div>
    </div>
  );
}
