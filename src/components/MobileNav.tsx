import React from 'react';
import { Link } from 'react-router-dom';

export const MobileNav: React.FC = () => {
  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-black/60 backdrop-blur-xl z-[100] rounded-t-[32px] shadow-[0_-4px_40px_rgba(185,255,102,0.05)] border-t border-white/5">
        <Link className="flex flex-col items-center justify-center p-2" to="/">
          <span className="text-xl">🟢</span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-primary">Painel</span>
        </Link>
        <Link className="flex flex-col items-center justify-center p-2" to="/ia">
          <span className="text-xl">🧠</span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/40">IA</span>
        </Link>
        <Link className="flex flex-col items-center justify-center p-2 hidden sm:flex" to="/clientes">
          <span className="text-xl">👥</span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/40">Clientes</span>
        </Link>
        <Link className="flex flex-col items-center justify-center p-2 hidden sm:flex" to="/performance">
          <span className="text-xl">📊</span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/40">Perf</span>
        </Link>
        <Link className="flex flex-col items-center justify-center p-2" to="/financeiro">
          <span className="text-xl">💰</span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/40">Financeiro</span>
        </Link>
        <Link className="flex flex-col items-center justify-center p-2" to="/setup">
          <span className="text-xl">⚙️</span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/40">Setup</span>
        </Link>
      </nav>
      
      {/* Floating Action Button (Mobile Only) */}
      <button className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-black active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined font-bold">add</span>
      </button>
    </>
  );
};
