import "react-native-gesture-handler";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import EditorScreen from "./src/screens/EditorScreen";

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {imageUri ? (
          <EditorScreen imageUri={imageUri} onBack={() => setImageUri(null)} />
        ) : (
          <HomeScreen onImagePicked={setImageUri} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
