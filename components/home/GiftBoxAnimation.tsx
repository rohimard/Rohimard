"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Camera, Music2, QrCode, Sparkles } from "lucide-react";

const STAGES = ["closed", "opening", "memories", "qr", "experience"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_DURATIONS: Record<Stage, number> = {
  closed: 1400,
  opening: 1100,
  memories: 2200,
  qr: 2000,
  experience: 3200,
};

/** Secuencia visual del hero: la caja se abre, aparecen recuerdos, luego el QR y la experiencia. */
export function GiftBoxAnimation() {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = STAGES[stageIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, STAGE_DURATIONS[stage]);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div className="relative mx-auto flex h-[420px] w-full max-w-sm items-center justify-center sm:h-[460px]">
      {/* Aura decorativa */}
      <div className="absolute h-64 w-64 rounded-full bg-rosa-200/40 blur-3xl" />
      <div className="absolute h-40 w-40 -translate-x-16 translate-y-24 rounded-full bg-dorado-200/40 blur-3xl" />

      <div className="relative flex h-full w-full items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === "closed" && (
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <BoxBase />
              <motion.div
                className="absolute -top-4 left-1/2 h-8 w-44 -translate-x-1/2 rounded-t-lg bg-borgona-600 shadow-soft"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <RibbonBow />
            </motion.div>
          )}

          {stage === "opening" && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <BoxBase glow />
              <motion.div
                className="absolute -top-4 left-1/2 h-8 w-44 -translate-x-1/2 origin-bottom rounded-t-lg bg-borgona-600 shadow-soft"
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -110, y: -14 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ transformPerspective: 400 }}
              />
              <motion.div
                className="absolute inset-x-10 top-6 h-24 rounded-full bg-dorado-100/70 blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              />
            </motion.div>
          )}

          {stage === "memories" && (
            <motion.div key="memories" className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BoxBase glow />
              <FloatingIcon icon={Heart} className="left-4 top-2 text-rubi-500" delay={0} />
              <FloatingIcon icon={Camera} className="right-6 top-0 text-borgona-600" delay={0.25} />
              <FloatingIcon icon={Music2} className="left-1/2 -top-6 -translate-x-1/2 text-dorado-500" delay={0.5} />
              <FloatingIcon icon={Sparkles} className="right-2 top-16 text-rosa-300" delay={0.75} />
            </motion.div>
          )}

          {stage === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="rounded-3xl border border-dorado-200 bg-blanco p-6 shadow-card">
                <QrCode className="h-28 w-28 text-borgona-700" strokeWidth={1.1} />
              </div>
              <p className="font-script text-2xl text-dorado-500">escanea y descubre</p>
            </motion.div>
          )}

          {stage === "experience" && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="w-56 rounded-[2rem] border-8 border-borgona-800 bg-gradient-to-b from-borgona-600 via-rubi-500 to-borgona-700 p-4 shadow-card"
            >
              <p className="text-center font-script text-3xl text-crema-50">Para Ana ❤️</p>
              <p className="mt-3 text-center text-xs leading-relaxed text-crema-100/85">
                Hay algo que quiero que recuerdes...
              </p>
              <div className="mx-auto mt-4 h-px w-16 bg-dorado-300/70" />
              <p className="mt-4 text-center text-[0.65rem] uppercase tracking-[0.2em] text-dorado-200">
                ✨ descubrir mi momentia
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BoxBase({ glow }: { glow?: boolean }) {
  return (
    <div
      className={`relative h-40 w-56 rounded-lg bg-gradient-to-br from-rubi-500 to-borgona-700 shadow-card ${glow ? "ring-4 ring-dorado-200/60" : ""}`}
    >
      <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-dorado-300/90" />
      <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-dorado-300/90" />
    </div>
  );
}

function RibbonBow() {
  return (
    <div className="absolute -top-3 left-1/2 h-6 w-10 -translate-x-1/2 rounded-full bg-dorado-300 shadow-soft" />
  );
}

function FloatingIcon({
  icon: Icon,
  className,
  delay,
}: {
  icon: typeof Heart;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute flex h-10 w-10 items-center justify-center rounded-full bg-blanco shadow-soft ${className}`}
      initial={{ opacity: 0, y: 10, scale: 0.6 }}
      animate={{ opacity: 1, y: [-4, -14, -4], scale: 1 }}
      transition={{ duration: 2.2, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="h-4 w-4" />
    </motion.div>
  );
}
