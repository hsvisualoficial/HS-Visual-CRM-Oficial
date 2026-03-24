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

  const initials = settings.agency_name
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'HS';

  const navItems = [
    { to: '/painel',      icon: '🟢', label: 'Painel' },
    { to: '/ia',          icon: '🧠', label: 'IA / Scripts' },
    { to: '/clientes',    icon: '👥', label: 'Clientes' },
    { to: '/performance', icon: '📊', label: 'Performance' },
    { to: '/financeiro',  icon: '💰', label: 'Financeiro' },
    { to: '/setup',       icon: '⚙️',  label: 'Configurações' },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <nav
        className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 z-50"
        style={{ background: '#0D0D0D', borderRight: '1px solid #1F1F1F' }}
      >
        {/* Logo / Avatar da Empresa */}
        <div className="mb-10">
          {settings.agency_logo_url ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center bg-black"
              style={{ border: '1px solid #E01183', boxShadow: '0 0 12px rgba(224,17,131,0.15)' }}>
              <img src={settings.agency_logo_url} alt={settings.agency_name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(224,17,131,0.1)', border: '1px solid rgba(224,17,131,0.3)', boxShadow: '0 0 12px rgba(224,17,131,0.12)' }}>
              <span className="text-[11px] font-black" style={{ color: '#E01183', fontFamily: 'Space Grotesk, sans-serif' }}>{initials}</span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex flex-col gap-7 w-full items-center flex-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className="nav-item relative group cursor-pointer flex justify-center">
              <span className="text-2xl transition-transform group-hover:scale-125">{item.icon}</span>
              <span className="nav-tooltip absolute left-16 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                style={{ background: '#141414', border: '1px solid #1F1F1F', color: '#E01183' }}>
                {item.label}
              </span>
            </Link>
          ))}

          <div className="w-8 h-px my-1" style={{ background: '#1F1F1F' }} />

          <Link to="/cadastro" target="_blank" className="nav-item relative group cursor-pointer flex justify-center">
            <span className="material-symbols-outlined text-[26px] transition-transform group-hover:scale-110"
              style={{ color: '#20C2AE' }}>group_add</span>
            <span className="nav-tooltip absolute left-16 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ background: 'rgba(32,194,174,0.1)', border: '1px solid rgba(32,194,174,0.3)', color: '#20C2AE' }}>
              Novo Cadastro
            </span>
          </Link>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="nav-item relative group cursor-pointer flex justify-center items-center w-12 h-12 rounded-xl transition-colors"
          style={{ background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,82,82,0.08)') }
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <span className="material-symbols-outlined text-[20px] transition-colors" style={{ color: '#4B5563' }}>logout</span>
          <span className="nav-tooltip absolute left-16 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
            style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.2)', color: '#FF5252' }}>
            Sair
          </span>
        </button>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full flex justify-between items-center px-5 py-3 z-50"
        style={{ background: 'rgba(13,13,13,0.95)', borderBottom: '1px solid #1F1F1F', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          {settings.agency_logo_url ? (
            <img src={settings.agency_logo_url} alt={settings.agency_name} className="h-7 w-auto object-contain" />
          ) : (
            <span className="text-lg font-black" style={{ color: '#E01183', fontFamily: 'Space Grotesk, sans-serif' }}>
              {settings.agency_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout}>
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'rgba(255,82,82,0.7)' }}>logout</span>
          </button>
          {settings.admin_avatar_url ? (
            <img src={settings.admin_avatar_url} alt="Admin" className="w-8 h-8 rounded-full object-cover"
              style={{ border: '1px solid rgba(224,17,131,0.4)' }} />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(224,17,131,0.1)', border: '1px solid rgba(224,17,131,0.3)' }}>
              <span className="text-[10px] font-black" style={{ color: '#E01183' }}>{initials}</span>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
