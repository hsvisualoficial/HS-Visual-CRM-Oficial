import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (import.meta.env.VITE_SUPABASE_URL) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Acesso Negado: " + error.message);
      } else {
        navigate('/painel');
      }
    } else {
      // Simulate login success if DB not configured yet
      navigate('/painel');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B9FF66]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="aura-glass p-10 rounded-3xl border border-white/5 relative z-10 glow-primary bg-black/40 backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 20px rgba(185,255,102,0.1)', '0 0 60px rgba(185,255,102,0.4)', '0 0 20px rgba(185,255,102,0.1)']
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-black border border-[#B9FF66]/30 flex items-center justify-center mb-6"
            >
              <span className="text-[#B9FF66] font-extrabold text-2xl tracking-tighter shadow-glow-primary">HS</span>
            </motion.div>
            <h1 className="text-3xl font-plus-jakarta font-bold text-white tracking-tight">Bem-vindo(a)</h1>
            <p className="text-[#B9FF66]/50 text-[10px] tracking-[0.3em] font-bold uppercase mt-2">Painel de Controle HS Visual</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#B9FF66]/70 font-bold ml-1">E-mail Corporativo</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="helder@hsvisual.com"
                className="w-full bg-[#0a0a0a]/80 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#B9FF66] focus:bg-white/5 transition-all font-plus-jakarta placeholder:text-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-widest text-[#B9FF66]/70 font-bold">Senha de Acesso</label>
                <a href="#" className="text-[10px] text-white/40 hover:text-white transition-colors">Esqueceu?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a]/80 border border-white/10 rounded-xl px-4 py-4 pr-12 text-sm text-white focus:outline-none focus:border-[#B9FF66] focus:bg-white/5 transition-all font-plus-jakarta placeholder:text-white/20 tracking-widest"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#B9FF66] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-white transition-all shadow-glow-primary hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Acessar Painel de Controle'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
