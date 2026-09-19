import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BUNDLED_STICKERS } from "../lib/stickers";
import { getGiphyApiKey, setGiphyApiKey, searchGiphy, type GiphyGifResult } from "../lib/giphy";

const ACTIVE_COLOR = "#4CC9F0";

type Tab = "own" | "giphy";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (uri: string) => void;
};

export default function StickerPicker({ visible, onClose, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>("own");
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GiphyGifResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    getGiphyApiKey().then(setApiKeyState);
  }, [visible]);

  const handleSaveKey = async () => {
    if (!keyInput.trim()) return;
    await setGiphyApiKey(keyInput.trim());
    setApiKeyState(keyInput.trim());
  };

  const handleSearch = async () => {
    if (!apiKey || !query.trim() || searching) return;
    setSearching(true);
    setSearchError(null);
    try {
      const gifs = await searchGiphy(query.trim(), apiKey);
      setResults(gifs);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "No se pudo buscar en Giphy.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Stickers</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, tab === "own" && styles.tabButtonActive]}
              onPress={() => setTab("own")}
            >
              <Text style={[styles.tabText, tab === "own" && styles.tabTextActive]}>Propios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, tab === "giphy" && styles.tabButtonActive]}
              onPress={() => setTab("giphy")}
            >
              <Text style={[styles.tabText, tab === "giphy" && styles.tabTextActive]}>Giphy</Text>
            </TouchableOpacity>
          </View>

          {tab === "own" ? (
            <ScrollView contentContainerStyle={styles.grid}>
              {BUNDLED_STICKERS.map((s) => (
                <TouchableOpacity key={s.id} style={styles.gridItem} onPress={() => onSelect(s.uri)}>
                  <Image source={{ uri: s.uri }} style={styles.gridImage} resizeMode="contain" />
                  <Text style={styles.gridLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : !apiKey ? (
            <View style={styles.giphySetup}>
              <Text style={styles.giphyHint}>
                Para buscar GIFs de Giphy necesitás tu propia API key gratuita (no la compartimos por
                costos/términos de uso).
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL("https://developers.giphy.com/dashboard/")}>
                <Text style={styles.giphyLink}>Conseguí una en developers.giphy.com/dashboard</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.keyInput}
                value={keyInput}
                onChangeText={setKeyInput}
                placeholder="Pegá tu API key acá"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveKey}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.giphyContent}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar GIFs (ej: corazón, fiesta)"
                  placeholderTextColor="#6B7280"
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={searching}>
                  {searching ? (
                    <ActivityIndicator color="#04121a" size="small" />
                  ) : (
                    <Ionicons name="search" size={18} color="#04121a" />
                  )}
                </TouchableOpacity>
              </View>
              {searchError && <Text style={styles.errorText}>{searchError}</Text>}
              <ScrollView contentContainerStyle={styles.grid}>
                {results.map((g) => (
                  <TouchableOpacity key={g.id} style={styles.gridItem} onPress={() => onSelect(g.gifUrl)}>
                    <Image source={{ uri: g.previewUrl }} style={styles.gridImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#141419",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "75%",
    minHeight: "50%",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { color: "#fff", fontSize: 17, fontWeight: "700" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1A1A22",
  },
  tabButtonActive: { backgroundColor: ACTIVE_COLOR },
  tabText: { color: "#9CA3AF", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#04121a" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 16 },
  gridItem: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: "#1A1A22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gridImage: { width: 60, height: 60 },
  gridLabel: { color: "#9CA3AF", fontSize: 10, marginTop: 2 },
  giphySetup: { gap: 12, paddingVertical: 8 },
  giphyHint: { color: "#9CA3AF", fontSize: 13.5, lineHeight: 19 },
  giphyLink: { color: ACTIVE_COLOR, fontSize: 13.5, fontWeight: "600" },
  keyInput: {
    backgroundColor: "#1A1A22",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: ACTIVE_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#04121a", fontWeight: "700", fontSize: 14 },
  giphyContent: { flex: 1, gap: 10 },
  searchRow: { flexDirection: "row", gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: "#1A1A22",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ACTIVE_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#FF6B6B", fontSize: 12.5 },
});
