import React from 'react';

export interface MessageBubbleProps {
  sender: 'ai' | 'user';
  text: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, text }) => {
  const isAi = sender === 'ai';
  
  return (
    <div className={`flex w-full mb-6 ${isAi ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl ${
          isAi 
          ? 'bg-[#151515]/80 backdrop-blur-md border border-[#ffd700]/30 glow-gold text-white/90 rounded-tl-sm' 
          : 'bg-[#B9FF66] text-[#050505] font-semibold rounded-tr-sm shadow-glow-primary'
        }`}
      >
        {isAi && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">✨</span>
            <span className="text-[10px] uppercase tracking-widest text-[#ffd700] font-bold">Insight de Valor</span>
          </div>
        )}
        <p className="text-sm font-plus-jakarta leading-relaxed">{text}</p>
      </div>
    </div>
  );
};
