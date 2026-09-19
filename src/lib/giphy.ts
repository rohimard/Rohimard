import AsyncStorage from "@react-native-async-storage/async-storage";

const GIPHY_KEY_STORAGE = "photobrush:giphy-api-key";

export async function getGiphyApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(GIPHY_KEY_STORAGE);
  } catch {
    return null;
  }
}

export async function setGiphyApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(GIPHY_KEY_STORAGE, key.trim());
}

export interface GiphyGifResult {
  id: string;
  previewUrl: string;
  gifUrl: string;
}

interface GiphyImageVariant {
  url: string;
}

interface GiphyApiGif {
  id: string;
  images: {
    fixed_width_small?: GiphyImageVariant;
    fixed_width?: GiphyImageVariant;
    original: GiphyImageVariant;
  };
}

/** Searches Giphy's public API for animated GIFs to use as moving stickers. */
export async function searchGiphy(query: string, apiKey: string): Promise<GiphyGifResult[]> {
  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    limit: "24",
    rating: "pg-13",
  });
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(res.status === 401 ? "API key de Giphy inválida" : `Giphy respondió ${res.status}`);
  }
  const json = (await res.json()) as { data: GiphyApiGif[] };
  return json.data.map((g) => ({
    id: g.id,
    previewUrl: g.images.fixed_width_small?.url ?? g.images.fixed_width?.url ?? g.images.original.url,
    gifUrl: g.images.fixed_width?.url ?? g.images.original.url,
  }));
}
