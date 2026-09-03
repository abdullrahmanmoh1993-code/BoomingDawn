import type { DawnStage } from "@/lib/types";

export interface DawnStageConfig {
  id: DawnStage;
  label: string;
  arabicLabel?: string;
  background: string;
  bgWidth: number;
  bgHeight: number;
  /** Subtle gradient overlays placed on top of the background for readability. */
  overlay: string;
  /** Small uppercase atmospheric accent shown in the header of the selection area. */
  mood: string;
}

export const dawnStages: Record<DawnStage, DawnStageConfig> = {
  nautical: {
    id: "nautical",
    label: "Nautical Dawn",
    arabicLabel: "فجر نويتيكال",
    background: "/images/dawn/nautical.jpg",
    bgWidth: 2352,
    bgHeight: 1008,
    overlay:
      "bg-gradient-to-b from-black/70 via-black/55 to-black/90",
    mood: "Cool · Calm · Transition",
  },
  astronomical: {
    id: "astronomical",
    label: "Astronomical Dawn",
    arabicLabel: "فجر فلكي",
    background: "/images/dawn/astronomical.jpg",
    bgWidth: 2352,
    bgHeight: 1008,
    overlay:
      "bg-gradient-to-b from-black/75 via-black/60 to-black/95",
    mood: "Deep · Dark · Mysterious",
  },
  "orange-rising": {
    id: "orange-rising",
    label: "Orange Rising",
    arabicLabel: "شروق برتقالي",
    background: "/images/dawn/orange-rising.jpg",
    bgWidth: 2352,
    bgHeight: 1008,
    overlay:
      "bg-gradient-to-b from-black/60 via-black/45 to-black/85",
    mood: "Warm · Energetic · Sunrise",
  },
};

export function getDawnStage(stage: DawnStage): DawnStageConfig {
  return dawnStages[stage] ?? dawnStages.nautical;
}