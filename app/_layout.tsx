import React from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { EditorProvider } from "../src/state/EditorContext";
import { useAppFonts } from "../src/lib/fonts";

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <EditorProvider>
          {fontsLoaded ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#0B0B0F" },
              }}
            />
          ) : (
            <View style={styles.loading}>
              <ActivityIndicator color="#4CC9F0" />
            </View>
          )}
        </EditorProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  loading: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
