"use client";

import { useState } from "react";
import { PinGate } from "@/components/experience/PinGate";
import { ExperienceClient } from "@/components/experience/ExperienceClient";
import type { ExperienceData } from "@/lib/types/experience";

export function PinGatedExperience({ slug }: { slug: string }) {
  const [data, setData] = useState<ExperienceData | null>(null);

  if (!data) return <PinGate slug={slug} onUnlock={setData} />;
  return <ExperienceClient data={data} />;
}
