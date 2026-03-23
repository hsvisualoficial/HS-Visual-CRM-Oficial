import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar focused on icons only for Build v22

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-10 bg-black/40 backdrop-blur-xl border-r border-white/5 z-50">
        <div className="mb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-magenta/10 border border-magenta/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.2)]">
              <span className="material-symbols-outlined text-magenta">bolt</span>
            </div>
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
          
          <Link to="/cadastro" className="nav-item relative group cursor-pointer flex justify-center" target="_blank">
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
      {/* Top Bar (Mobile Only Logo) */}
      <header className="md:hidden fixed top-8 w-full flex justify-between items-center px-6 py-4 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#B9FF66] tracking-tight font-plus-jakarta">HS Visual</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="material-symbols-outlined text-red-400/80">logout</button>
          <button className="material-symbols-outlined text-white/60">account_circle</button>
        </div>
      </header>
    </>
  );
};

