import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full py-12 flex flex-col items-center gap-2 text-center px-8 mt-12">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-white font-bold tracking-tight">HS Visual</span>
        <span className="text-white/20">|</span>
        <a className="text-[#66FFED] underline font-plus-jakarta text-[10px] uppercase tracking-widest" href="https://hsvisual.com" target="_blank" rel="noreferrer">hsvisual.com</a>
      </div>
      <p className="font-plus-jakarta text-[10px] uppercase tracking-widest opacity-40 text-white/40">
        HS Visual | CNPJ: 52.672.332/0001-16
      </p>
    </footer>
  );
};
