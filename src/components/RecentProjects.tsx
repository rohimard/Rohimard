import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RecentProject } from "../types";

type Props = {
  projects: RecentProject[];
  onSelect: (project: RecentProject) => void;
};

export default function RecentProjects({ projects, onSelect }: Props) {
  if (projects.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={28} color="#3A3A44" />
        <Text style={styles.emptyText}>Tus proyectos recientes van a aparecer acá.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {projects.map((project) => (
        <TouchableOpacity
          key={project.id}
          style={styles.card}
          onPress={() => onSelect(project)}
          activeOpacity={0.75}
        >
          <Image source={{ uri: project.uri }} style={styles.thumb} resizeMode="cover" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 10,
    backgroundColor: "#111116",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E1E26",
  },
  emptyText: { color: "#6B7280", fontSize: 13.5, textAlign: "center" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: 104,
    height: 104,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#15151C",
    borderWidth: 1,
    borderColor: "#26262F",
  },
  thumb: { width: "100%", height: "100%" },
});
