import { Image } from "react-native";

export interface StickerAsset {
  id: string;
  label: string;
  uri: string;
}

// Metro bundles these like any other image asset; Image.resolveAssetSource
// turns the require() module id into a URI usable by StickerElement.uri —
// the same field a remote Giphy GIF URL goes into.
const MODULES: Record<string, number> = {
  heart: require("../../assets/stickers/heart.gif"),
  star: require("../../assets/stickers/star.gif"),
  sparkle: require("../../assets/stickers/sparkle.gif"),
  confetti: require("../../assets/stickers/confetti.gif"),
  fire: require("../../assets/stickers/fire.gif"),
  thumbsup: require("../../assets/stickers/thumbsup.gif"),
  sun: require("../../assets/stickers/sun.gif"),
  music: require("../../assets/stickers/music.gif"),
};

const LABELS: Record<string, string> = {
  heart: "Corazón",
  star: "Estrella",
  sparkle: "Brillo",
  confetti: "Confeti",
  fire: "Fuego",
  thumbsup: "Me gusta",
  sun: "Sol",
  music: "Música",
};

export const BUNDLED_STICKERS: StickerAsset[] = Object.keys(MODULES).map((id) => ({
  id,
  label: LABELS[id] ?? id,
  uri: Image.resolveAssetSource(MODULES[id]).uri,
}));
