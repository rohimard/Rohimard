import { useFonts } from "expo-font";
import { Poppins_700Bold } from "@expo-google-fonts/poppins";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import { Caveat_700Bold } from "@expo-google-fonts/caveat";
import type { FontId, FontOption } from "../types";

// System font has no custom family: undefined lets RN/SVG fall back to the
// platform default (San Francisco / Roboto), which needs no loading.
export const FONT_OPTIONS: Record<FontId, FontOption> = {
  system: { id: "system", label: "Sistema", fontFamily: undefined },
  poppins: { id: "poppins", label: "Poppins", fontFamily: "Poppins_700Bold" },
  bebasNeue: { id: "bebasNeue", label: "Bebas Neue", fontFamily: "BebasNeue_400Regular" },
  pacifico: { id: "pacifico", label: "Pacifico", fontFamily: "Pacifico_400Regular" },
  anton: { id: "anton", label: "Anton", fontFamily: "Anton_400Regular" },
  caveat: { id: "caveat", label: "Caveat", fontFamily: "Caveat_700Bold" },
};

export const FONT_LIST: FontOption[] = Object.values(FONT_OPTIONS);

/** Loads every custom font used by the Font picker. Call once near the app root. */
export function useAppFonts() {
  return useFonts({
    Poppins_700Bold,
    BebasNeue_400Regular,
    Pacifico_400Regular,
    Anton_400Regular,
    Caveat_700Bold,
  });
}

export function resolveFontFamily(fontId: FontId): string | undefined {
  return FONT_OPTIONS[fontId].fontFamily;
}
