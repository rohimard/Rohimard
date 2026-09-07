"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";

export function IntroScreen({ recipientName, introMessage, onEnter }: { recipientName: string; introMessage: string; onEnter: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-borgona-800 via-borgona-700 to-rubi-600 px-6 text-center text-crema-50">
      <FloatingHearts />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <p className="eyebrow !text-dorado-200">MOMENTIA</p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mt-6 font-script text-5xl text-blanco sm:text-6xl"
      >
        Para {recipientName} <Heart className="inline h-8 w-8 fill-rosa-200 text-rosa-200" />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-6 max-w-xs text-balance text-sm leading-relaxed text-crema-100/85 sm:text-base"
      >
        {introMessage}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        onClick={onEnter}
        className="btn-gold mt-12 animate-pulse-soft"
      >
        <Sparkles className="h-4 w-4" /> Descubrir mi Momentia
      </motion.button>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 8 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
      {hearts.map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          style={{ left: `${(i * 13 + 5) % 100}%` }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 0] }}
          transition={{ duration: 10 + i, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
        >
          ❤
        </motion.span>
      ))}
    </div>
  );
}
