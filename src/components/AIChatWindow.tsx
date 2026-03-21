import React, { useState, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

export interface AIChatWindowProps {
  clientName: string;
  clientFocus: string;
  clientFunction?: string;
  clientCreci?: string;
  contractValue?: string;
}

export const AIChatWindow: React.FC<AIChatWindowProps> = ({ 
  clientName, 
  clientFocus,
  clientFunction,
  clientCreci,
  contractValue
}) => {
  const [messages, setMessages] = useState<{id: number, sender: 'user' | 'ai', text: string}[]>([
    { id: 1, sender: 'ai', text: `Olá, Helder! Sou a Aura IA, sua Estrategista de Marketing na HS Visual. Analisei o dossiê de ${clientName} (${clientFunction || clientFocus}). Com um contrato de ${contractValue || 'valor sob consulta'} e CRECI: ${clientCreci || 'N/A'}, identifiquei novas frentes de tração imobiliária. Qual script ou tese de tráfego pago vamos validar hoje?` },
  ]);
  const [inputValue, setInputValue] = useState('');

  // Update initial message when lead changes
  useEffect(() => {
    const contextText = `Contexto sintonizado para ${clientName}. 
🎯 Atuação: ${clientFunction || clientFocus}
📄 CRECI: ${clientCreci || 'N/A'}
💰 Investimento: ${contractValue || 'N/A'}

Sou sua Estrategista de Marketing HS Visual. Vamos gerar o script de vídeo ou a copy de tráfego agora?`;
    
    setMessages([{ id: Date.now(), sender: 'ai' as const, text: contextText }]);
  }, [clientName, clientFocus, clientFunction, clientCreci, contractValue]);

  const generateResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Script generation
    if (lowerInput.includes('gerar script') || lowerInput.includes('script') || lowerInput.includes('vídeo')) {
      return `Aqui está uma tese estratégica para o script de vídeo de ${clientName}:

"E aí, você corretor que atua como ${clientFunction || 'especialista'}... Já percebeu que o lead de ${clientFocus} não quer apenas um imóvel, ele quer segurança e agilidade? O CRECI ${clientCreci || 'Ativo'} é sua garantia de ética, mas o que vai fechar a venda é esse projeto que estou te mostrando agora."

💡 **Dica de Estrategista (HS Visual):** Como o investimento é de ${contractValue || 'valor premium'}, sugiro uma campanha de tráfego pago no Meta com objetivo de 'Engajamento no Direct'. O público alvo deve ser segmentado por 'Interesse em Investimentos Imobiliários' e 'Bens de Luxo'. 

Deseja que eu refine os gatilhos mentais desse roteiro ou prefere focar na copy dos anúncios?`;
    }
    
    // Help commands
    if (lowerInput.includes('performance') || lowerInput.includes('roi') || lowerInput.includes('tráfego')) {
      return `Analisando a performance tática para ${clientName}: 
Considerando o segmento de ${clientFocus}, o CPL (Custo por Lead) ideal deve orbitar entre R$ 15 e R$ 25. Se estiver acima disso, precisamos revisar o criativo do vídeo imediatamente. 

Deseja que eu simule uma calculadora de ROI baseada no aporte de ${contractValue || 'contrato'}?`;
    }
    
    return `Alinhado, Helder. Como Estrategista da HS Visual, meu foco para ${clientName} é converter o lead frio em visita agendada. Podemos focar em:
1. Script de Roteiro para Reels Imobiliário.
2. Estrutura de Campanha (Público + Copy).
3. Quebra de Objeções para o WhatsApp Comercial.

Qual dessas frentes vamos atacar primeiro?`;
  };

  const handleSend = (textOverride?: string) => {
    const textToProcess = textOverride || inputValue;
    if (!textToProcess.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: textToProcess }]);
    setInputValue('');
    
    setTimeout(() => {
      const response = generateResponse(textToProcess);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: response }]);
    }, 1000);
  };

  const quickActions = [
    'Gerar Script de Venda',
    'Resumir Performance',
    'Próximo Passo'
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#B9FF66]/5 to-[#050505] rounded-xl border border-white/5 overflow-hidden shadow-[inset_0_0_100px_rgba(185,255,102,0.02)]">
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar whitespace-pre-wrap">
        {messages.map(m => (
          <MessageBubble key={m.id} sender={m.sender} text={m.text} />
        ))}
      </div>
      
      <div className="p-4 bg-black/60 backdrop-blur-xl border-t border-white/5 pb-24 md:pb-4">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
          {quickActions.map(action => (
            <button 
              key={action} 
              onClick={() => handleSend(action)}
              className="px-4 py-2 rounded-full border border-[#B9FF66]/30 text-[#B9FF66] bg-[#B9FF66]/5 text-xs font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#B9FF66]/20 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
        
        {/* Input */}
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite seu comando para a IA de Perfomance..." 
            className="w-full bg-[#111111] border border-white/10 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]/50 transition-all font-plus-jakarta placeholder:text-white/30"
          />
          <button 
            onClick={() => handleSend()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#B9FF66] text-black hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
