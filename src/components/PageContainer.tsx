import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface PageContainerProps {
  children: React.ReactNode;
  /** Padding extra no topo (para páginas sem Topbar embutido) */
  noPadTop?: boolean;
}

/**
 * PageContainer — wrapper centralizado padrão aplicado em todas as páginas.
 * Garante: Sidebar fixa, max-width consistente, padding responsivo.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, noPadTop }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main
        className={`
          md:pl-20
          ${noPadTop ? 'pt-0' : 'pt-20 md:pt-8'}
          px-4 md:px-8 lg:px-12
          max-w-7xl
          mx-auto
          pb-32 md:pb-12
        `}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
};
