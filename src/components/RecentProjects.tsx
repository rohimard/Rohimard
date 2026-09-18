import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import type { RecentProject } from "../types";

type Props = {
  projects: RecentProject[];
  onSelect: (project: RecentProject) => void;
};

export default function RecentProjects({ projects, onSelect }: Props) {
  if (projects.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Tus proyectos recientes van a aparecer acá.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {projects.map((project) => (
        <TouchableOpacity key={project.id} style={styles.card} onPress={() => onSelect(project)}>
          <Image source={{ uri: project.uri }} style={styles.thumb} resizeMode="cover" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: { color: "#6B7280", fontSize: 14, textAlign: "center" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: 96,
    height: 96,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1A1A22",
  },
  thumb: { width: "100%", height: "100%" },
});
