import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import RecentProjects from "../src/components/RecentProjects";
import { getRecentProjects, addRecentProject } from "../src/lib/storage";
import type { RecentProject } from "../src/types";

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

  const takePhoto = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;
      const result = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (!result.canceled && result.assets[0]) {
        openEditor(result.assets[0].uri);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, openEditor]);

  const onNewImage = useCallback(() => {
    if (busy) return;
    Alert.alert("Nueva imagen", "¿De dónde tomamos la foto?", [
      { text: "Cámara", onPress: takePhoto },
      { text: "Galería", onPress: pickFromLibrary },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, [busy, takePhoto, pickFromLibrary]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.title}>PhotoBrush</Text>
          <Text style={styles.subtitle}>Dibuja con texto sobre tus fotos, a mano</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={onNewImage} disabled={busy}>
            <Text style={styles.primaryButtonText}>Nueva imagen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={pickFromLibrary} disabled={busy}>
            <Text style={styles.secondaryButtonText}>Abrir de galería</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentsSection}>
          <Text style={styles.recentsTitle}>Recientes</Text>
          <RecentProjects projects={recents} onSelect={(p) => openEditor(p.uri)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  scrollContent: { flexGrow: 1, padding: 24 },
  hero: { marginTop: 32, marginBottom: 40 },
  title: { color: "#fff", fontSize: 34, fontWeight: "800" },
  subtitle: { color: "#9CA3AF", fontSize: 15, marginTop: 6 },
  actions: { gap: 12, marginBottom: 40 },
  primaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: "#0B0B0F", fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    backgroundColor: "#1A1A22",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  recentsSection: { flex: 1 },
  recentsTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14 },
});
