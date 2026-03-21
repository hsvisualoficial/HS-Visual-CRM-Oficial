import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HeaderMetrics } from './HeaderMetrics';
import { Opportunities } from './Opportunities';
import { AIInsights } from './AIInsights';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

export const Painel: React.FC = () => {
  return (
    <>
      <Sidebar />
      <main className="pt-24 md:pt-20 px-6 max-w-7xl mx-auto space-y-12">
        <Topbar title="Painel de Controle" subtitle="Visão Geral do Ecossistema HS Visual" />
        <HeaderMetrics />
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Opportunities />
          <AIInsights />
        </section>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
};
