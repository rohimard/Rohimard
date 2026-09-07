"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IntroScreen } from "@/components/experience/IntroScreen";
import { WelcomeSection } from "@/components/experience/sections/WelcomeSection";
import { StorySection } from "@/components/experience/sections/StorySection";
import { GallerySection } from "@/components/experience/sections/GallerySection";
import { VideoSection } from "@/components/experience/sections/VideoSection";
import { MusicSection } from "@/components/experience/sections/MusicSection";
import { LetterSection } from "@/components/experience/sections/LetterSection";
import { FinalSection } from "@/components/experience/sections/FinalSection";
import type { ExperienceData } from "@/lib/types/experience";

export function ExperienceClient({ data }: { data: ExperienceData }) {
  const [started, setStarted] = useState(false);

  const photos = data.media.filter((m) => m.type === "photo");
  const videos = data.media.filter((m) => m.type === "video");

  return (
    <div className="min-h-screen bg-gradient-to-b from-borgona-800 via-borgona-700 to-borgona-800">
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <IntroScreen recipientName={data.recipientName} introMessage={data.introMessage} onEnter={() => setStarted(true)} />
          </motion.div>
        ) : (
          <motion.div key="experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {data.welcomeMessage && <WelcomeSection message={data.welcomeMessage} senderName={data.senderName} />}
            {data.story && <StorySection story={data.story} />}
            {photos.length > 0 && <GallerySection photos={photos} />}
            {videos[0] && <VideoSection video={videos[0]} />}
            {data.music && data.music.option !== "sin_musica" && <MusicSection music={data.music} />}
            {data.letter && <LetterSection letter={data.letter} />}
            <FinalSection message={data.finalMessage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
