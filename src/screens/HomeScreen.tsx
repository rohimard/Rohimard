import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

type Props = {
  onImagePicked: (uri: string) => void;
};

export default function HomeScreen({ onImagePicked }: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PhotoBrush</Text>
      <Text style={styles.subtitle}>
        Dibuja texto sobre tus fotos deslizando el dedo
      </Text>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Elegir una foto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { color: "#fff", fontSize: 32, fontWeight: "700", marginBottom: 8 },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 15,
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: { color: "#0B0B0F", fontSize: 16, fontWeight: "600" },
});
