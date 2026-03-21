import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center overflow-hidden relative perspective-1000">
      {/* Background Glows (Orbital) */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 left-1/4 w-[50vw] h-[50vw] bg-[#B9FF66]/10 rounded-full blur-[140px] pointer-events-none" 
      />
      
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#66FFED]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, rotateX: 20, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="z-10 text-center max-w-5xl px-6 relative"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block mb-8 px-5 py-2 rounded-full border border-[#B9FF66]/30 bg-[#B9FF66]/10 text-[#B9FF66] text-xs font-bold tracking-[0.25em] uppercase shadow-glow-primary backdrop-blur-md"
        >
          Ecosistema Premium HS Visual
        </motion.div>
        
        <div className="relative mb-12">
          <motion.div 
            animate={{ rotateY: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto rounded-full border-2 border-[#B9FF66]/50 bg-black flex items-center justify-center text-4xl font-black text-[#B9FF66] shadow-[0_0_50px_rgba(185,255,102,0.3)] mb-8"
            style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            HS
          </motion.div>
          
          {/* Orbital Orbs */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#66FFED] rounded-full blur-[2px] shadow-[0_0_15px_#66FFED]" />
          </motion.div>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
          Acelere do jeito certo. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B9FF66] to-[#66FFED] neon-text-primary drop-shadow-[0_0_25px_rgba(185,255,102,0.5)]">
            Aura HS Visual.
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
          O único painel fechado de captação, tráfego e gestão desenhado exclusivamente para players de alta performance e imobiliário de luxo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <Link to="/cadastro">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(185,255,102,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="h-16 px-10 rounded-full bg-[#B9FF66] text-black font-extrabold text-sm tracking-widest uppercase hover:bg-white transition-all glow-primary flex items-center gap-4"
            >
              Iniciar Onboarding
              <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
            </motion.button>
          </Link>
          
          <Link to="/login">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="h-16 px-10 rounded-full aura-glass border border-white/20 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-4"
            >
              Console do Gestor
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>
      
      {/* Decorative Grid Floor */}
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-[#B9FF66]/5 to-transparent flex items-end justify-center perspective-[500px] pointer-events-none opacity-40">
        <div className="w-[200vw] h-[100vh] border-t border-[#B9FF66]/20 bg-[linear-gradient(to_right,#B9FF6611_1px,transparent_1px),linear-gradient(to_bottom,#B9FF6611_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:rotateX(75deg)_translateY(50%)] mask-image:linear-gradient(to_top,black,transparent)]" />
      </div>
    </div>
  );
}
