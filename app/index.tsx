import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import RecentProjects from "../src/components/RecentProjects";
import BrandMark from "../src/components/BrandMark";
import { getRecentProjects, addRecentProject } from "../src/lib/storage";
import { BRAND_FONT_BOLD, BRAND_FONT_SEMIBOLD } from "../src/lib/fonts";
import type { RecentProject } from "../src/types";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const [recents, setRecents] = useState<RecentProject[]>([]);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getRecentProjects().then(setRecents);
    }, [])
  );

  const openEditor = useCallback(
    (uri: string) => {
      Image.getSize(
        uri,
        async (width, height) => {
          await addRecentProject({ uri, width, height });
          router.push({
            pathname: "/editor",
            params: { uri, width: String(width), height: String(height) },
          });
        },
        () => Alert.alert("Error", "No se pudo leer esta imagen.")
      );
    },
    [router]
  );

  const pickFromLibrary = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled && result.assets[0]) {
        openEditor(result.assets[0].uri);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, openEditor]);

  const openCamera = useCallback(() => {
    if (busy) return;
    router.push("/camera");
  }, [busy, router]);

  const onNewImage = useCallback(() => {
    if (busy) return;
    Alert.alert("Nueva imagen", "¿De dónde tomamos la foto?", [
      { text: "Cámara", onPress: openCamera },
      { text: "Galería", onPress: pickFromLibrary },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, [busy, openCamera, pickFromLibrary]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.markWrap} pointerEvents="none">
        <BrandMark width={SCREEN_WIDTH * 1.15} height={SCREEN_WIDTH * 1.15} opacity={0.22} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.title}>
            Photo<Text style={styles.titleAccent}>Brush</Text>
          </Text>
          <Text style={styles.subtitle}>
            El editor con <Text style={styles.subtitleAccent}>Text Brush</Text>: tu texto sigue el
            trazo de tu dedo
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.buttonDisabled]}
            onPress={onNewImage}
            disabled={busy}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color="#04121a" />
            <Text style={styles.primaryButtonText}>Nueva imagen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, busy && styles.buttonDisabled]}
            onPress={pickFromLibrary}
            disabled={busy}
            activeOpacity={0.85}
          >
            <Ionicons name="images-outline" size={18} color="#f2f2f5" />
            <Text style={styles.secondaryButtonText}>Abrir de galería</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentsSection}>
          <View style={styles.recentsHeader}>
            <Text style={styles.recentsTitle}>Recientes</Text>
            {recents.length > 0 && (
              <View style={styles.recentsBadge}>
                <Text style={styles.recentsBadgeText}>{recents.length}</Text>
              </View>
            )}
          </View>
          <RecentProjects projects={recents} onSelect={(p) => openEditor(p.uri)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  markWrap: {
    position: "absolute",
    top: -SCREEN_WIDTH * 0.35,
    right: -SCREEN_WIDTH * 0.5,
  },
  scrollContent: { flexGrow: 1, padding: 24 },
  hero: { marginTop: 40, marginBottom: 44 },
  title: { color: "#f2f2f5", fontSize: 40, fontFamily: BRAND_FONT_BOLD },
  titleAccent: { color: "#4CC9F0" },
  subtitle: { color: "#9CA3AF", fontSize: 15.5, marginTop: 10, lineHeight: 22, maxWidth: 280 },
  subtitleAccent: { color: "#FFD23F", fontWeight: "700" },
  actions: { gap: 12, marginBottom: 44 },
  primaryButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#4CC9F0",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CC9F0",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonText: { color: "#04121A", fontSize: 16, fontFamily: BRAND_FONT_SEMIBOLD },
  secondaryButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#15151C",
    borderWidth: 1,
    borderColor: "#26262F",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: "#f2f2f5", fontSize: 16, fontFamily: BRAND_FONT_SEMIBOLD },
  buttonDisabled: { opacity: 0.5 },
  recentsSection: { flex: 1 },
  recentsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  recentsTitle: { color: "#f2f2f5", fontSize: 18, fontFamily: BRAND_FONT_SEMIBOLD },
  recentsBadge: {
    backgroundColor: "#15151C",
    borderWidth: 1,
    borderColor: "#26262F",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  recentsBadgeText: { color: "#9CA3AF", fontSize: 12, fontWeight: "700" },
});
