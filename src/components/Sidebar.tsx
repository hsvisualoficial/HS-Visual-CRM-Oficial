import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Gera iniciais do nome da agência como fallback
  const initials = settings.agency_name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'HS';

  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-10 bg-black/40 backdrop-blur-xl border-r border-white/5 z-50">
        {/* Logo da empresa */}
        <div className="mb-12">
          <div className="flex flex-col items-center gap-3">
            {settings.agency_logo_url ? (
              <div className="w-11 h-11 rounded-full border border-[#B9FF66]/40 overflow-hidden flex items-center justify-center bg-black shadow-[0_0_15px_rgba(185,255,102,0.2)]">
                <img
                  src={settings.agency_logo_url}
                  alt={settings.agency_name}
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#B9FF66]/10 border border-[#B9FF66]/40 flex items-center justify-center shadow-[0_0_15px_rgba(185,255,102,0.2)]">
                <span className="text-[10px] font-black text-[#B9FF66] tracking-tighter">{initials}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 w-full items-center">
          <Link to="/painel" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="text-2xl transition-transform group-hover:scale-125">🟢</span>
            <span className="nav-tooltip absolute left-16 bg-white/10 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">Painel</span>
          </Link>
          <Link to="/ia" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="text-2xl transition-transform group-hover:scale-125">🧠</span>
            <span className="nav-tooltip absolute left-16 bg-white/10 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">IA / Scripts</span>
          </Link>
          <Link to="/clientes" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="text-2xl transition-transform group-hover:scale-125">👥</span>
            <span className="nav-tooltip absolute left-16 bg-white/10 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">Clientes</span>
          </Link>
          <Link to="/performance" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="text-2xl transition-transform group-hover:scale-125">📊</span>
            <span className="nav-tooltip absolute left-16 bg-white/10 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">Performance</span>
          </Link>
          <Link to="/financeiro" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="text-2xl transition-transform group-hover:scale-125">💰</span>
            <span className="nav-tooltip absolute left-16 bg-white/10 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">Financeiro</span>
          </Link>
          <Link to="/setup" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="text-2xl transition-transform group-hover:scale-125">⚙️</span>
            <span className="nav-tooltip absolute left-16 bg-white/10 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">Configurações</span>
          </Link>

          <div className="w-8 h-px bg-white/10 my-1"></div>

          <Link to="/cadastro" target="_blank" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="material-symbols-outlined text-[28px] text-[#B9FF66] transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_rgba(185,255,102,0.5)]">group_add</span>
            <span className="nav-tooltip absolute left-16 bg-[#B9FF66]/10 border border-[#B9FF66]/30 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-[#B9FF66] whitespace-nowrap">Novo Cadastro</span>
          </Link>
        </div>

        <div className="mt-auto w-full flex flex-col items-center">
          <button onClick={handleLogout} className="nav-item relative group cursor-pointer flex justify-center items-center w-12 h-12 rounded-xl hover:bg-red-500/10 transition-colors">
            <span className="material-symbols-outlined text-white/40 group-hover:text-red-400 transition-colors">logout</span>
            <span className="nav-tooltip absolute left-16 bg-red-500/10 border border-red-500/20 backdrop-blur-lg px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-red-400 whitespace-nowrap">Sair do Sistema</span>
          </button>
        </div>
      </nav>

      {/* Top Bar (Mobile) */}
      <header className="md:hidden fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-black/40 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          {settings.agency_logo_url ? (
            <img src={settings.agency_logo_url} alt={settings.agency_name} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold text-[#B9FF66] tracking-tight">{settings.agency_name}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="material-symbols-outlined text-red-400/80">logout</button>
          {settings.admin_avatar_url ? (
            <img src={settings.admin_avatar_url} alt="Admin" className="w-8 h-8 rounded-full object-cover border border-[#B9FF66]/30" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#B9FF66]/10 border border-[#B9FF66]/30 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#B9FF66]">{initials}</span>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
