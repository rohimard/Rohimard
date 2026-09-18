import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RecentProject } from "../types";

const RECENTS_KEY = "photobrush:recent-projects";
const MAX_RECENTS = 12;

export async function getRecentProjects(): Promise<RecentProject[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addRecentProject(
  project: Omit<RecentProject, "id" | "updatedAt">
): Promise<RecentProject[]> {
  const existing = await getRecentProjects();
  const withoutDuplicate = existing.filter((p) => p.uri !== project.uri);
  const next: RecentProject[] = [
    { ...project, id: `${Date.now()}`, updatedAt: Date.now() },
    ...withoutDuplicate,
  ].slice(0, MAX_RECENTS);
  await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  return next;
}
