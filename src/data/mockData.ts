import logoSilvia from '../assets/logos/logo-silvia.png.png';
import logoAdriana from '../assets/logos/logo-adriana.png.png';
import logoPrime from '../assets/logos/logo-prime.png.png';
import logoFabiana from '../assets/logos/logo-fabiana.png.png';
import logoAdmin from '../assets/logos/logo-administradora.png.jpg';

export const mockData = {
  alert: {
    message: "Silvia Pires: Vencimento em 48h",
    actionText: "COBRAR AGORA",
    actionUrl: "https://wa.me/?text=Olá%20Silvia,%20Hélder%20aqui!%20Passando%20para%20avisar%20que%20sua%20mensalidade%20da%20HS%20Visual%20vence%20em%20breve.%20Segue%20o%20link%20para%20facilitar!"
  },
  user: {
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAn2625kJrULX793RnJOleNAbtQJ-e-WsL1Yr_ZB5-cbIgXJ2E0jZqZYtr-XwUzmkaRJyUXoOmyMEUuE0QvFAOOIs3h96oMfufqCaQaXNqxo46awQgMNMOUDBdITfE7KoyLdSnhpuCLGa5z6rlsWY_7lopXswW0dyiKYhPsbMD1mMPLAYrKL3diiRb0cgMuXnQ4hNAixgltqJUeCfTjjoo7b1uZ9SrQqelBBYynEOjdLjSdyk1JaX93i8qARlTraHIMwdQd0yOyotk"
  },
  metrics: {
    negotiation: {
      value: "R$ 142.850",
      change: "+12.5% este mês",
      trendIcon: "trending_up"
    },
    clients: {
      total: 84,
      newLeads: "12 leads novos aguardando"
    },
    roi: {
      value: "5.8x",
      status: "Performance Otimizada"
    }
  },
  opportunities: [
    {
      id: "opt-1",
      name: "Ricardo Alcantara",
      tag1: "Meta Ads",
      tag2: "SMART FOLLOW-UP",
      tag2Icon: "bolt",
      value: "R$ 12.500",
      status: "Parado há 26h",
      statusColor: "text-error",
      icon: "ads_click",
      iconColor: "text-tertiary",
      borderClass: "border-l-tertiary glow-tertiary"
    },
    {
      id: "opt-2",
      name: "Imobiliária Prime",
      tag1: "Google Ads",
      tag2: "Negociação",
      tag2Icon: "",
      value: "R$ 45.000",
      status: "Atualizado hoje",
      statusColor: "text-white/40",
      icon: "search",
      iconColor: "text-primary",
      borderClass: "group hover:bg-white/5 transition-colors"
    }
  ],
  insights: {
    title: "Alerta de Inteligência",
    dropPercentage: "14%",
    description: "na taxa de resposta em leads de Google Ads. Recomendamos ajustar o script de abordagem inicial para o nicho imobiliário.",
    action: "Analisar e Reverter"
  },
  crmClients: [
    {
      id: "cli-1",
      name: "Silvia Pires",
      focus: "Lotes/Indaiatuba",
      origin: "Google Ads",
      status: "Quente",
      roi: "4.2x",
      logo: logoSilvia
    },
    {
      id: "cli-2",
      name: "Adriana Arini",
      focus: "Imóveis de Luxo/Vinhedo",
      origin: "Meta Ads",
      status: "Em Fechamento",
      roi: "8.5x",
      logo: logoAdriana
    },
    {
      id: "cli-3",
      name: "Prime Táxi",
      focus: "Executivo/Lollapalooza",
      origin: "Referência",
      status: "Negociação",
      roi: "3.1x",
      logo: logoPrime
    },
    {
      id: "cli-4",
      name: "Fabiana Luma",
      focus: "Lançamento/Apartamentos",
      origin: "Instagram",
      status: "Negociação",
      roi: "2.5x",
      logo: logoFabiana
    },
    {
      id: "cli-5",
      name: "Administradora",
      focus: "Gestão Predial/B2B",
      origin: "Cold Call",
      status: "Fechado",
      roi: "12.0x",
      logo: logoAdmin
    }
  ],
  financeData: {
    totalRevenue: "R$ 155.000",
    totalInvested: "R$ 22.000",
    profitMargin: "+62.5%",
    transactions: [
      { id: "tx-1", client: "Adriana Arini", type: "Contrato Anual (Luxo)", value: "R$ 120.000", status: "Pago", date: "12 Mar 2026" },
      { id: "tx-2", client: "Silvia Pires", type: "Projeto Lotes", value: "R$ 30.500", status: "Aguardando", date: "15 Mar 2026" },
      { id: "tx-3", client: "Contrato Promocional", type: "Plano 6 Meses", value: "R$ 4.500", status: "Pago (R$ 750/mês)", date: "18 Mar 2026" }
    ]
  }
};
