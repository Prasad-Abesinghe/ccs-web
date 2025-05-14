import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Level {
  id: string;
  name: string;
  description: string;
  children: Level[];
  has_sensor?: boolean;
  sensor_data?: SensorData[];
  widget_urls?: string | string[];
  type?: string;
  level_summary?: LevelSummary;
}

export interface LevelSummary {
  active: number;
  inactive: number;
  normal: number;
  warnings: number;
  critical: number;
}

export interface SensorData {
  sensor_id: string;
  sensor_type: string;
  sensor_value: null | string;
  widget_url: string;
  warning?: boolean;
}

export function findLevelById(levels: Level[], id: string): Level | null {
  // Special case: if id is "0", return the first level
  if (id === "0" && levels.length > 0) {
    return levels[0] ?? null;
  }
  // Otherwise, find the level by id
  for (const level of levels) {
    if (level.id === id) return level;
    const found = findLevelById(level.children, id);
    if (found) return found;
  }
  return null;
}

export function findParentLevel(
  levels: Level[],
  childId: string,
): Level | null {
  for (const level of levels) {
    // Check if any direct child matches the childId
    if (level.children.some((child) => child.id === childId)) {
      return level;
    }

    // Check deeper in the hierarchy
    const foundInChildren = findParentLevel(level.children, childId);
    if (foundInChildren) {
      return foundInChildren;
    }
  }

  return null;
}

export function getParentChain(levels: Level[], targetId: string): Level[] {
  const chain: Level[] = [];

  function search(currentLevel: Level, targetId: string): boolean {
    if (currentLevel.id === targetId) {
      chain.push(currentLevel);
      return true;
    }

    for (const child of currentLevel.children) {
      if (search(child, targetId)) {
        chain.unshift(currentLevel);
        return true;
      }
    }

    return false;
  }

  for (const level of levels) {
    if (search(level, targetId)) {
      return chain;
    }
  }

  return [];
}

