"use server";

import fs from "fs";
import path from "path";

// Define the Level type directly to avoid import issues
export interface Level {
  id: string;
  name: string;
  description: string;
  children: Level[];
  has_sensor?: boolean;
  sensor_data?: SensorData[];
  widget_urls?: string;
}

interface SensorData {
  sensor_id: string;
  sensor_type: string;
  sensor_value: number;
  warning: boolean;
  widget_url?: string;
}

export interface LevelsData {
  levels: Level[];
}

// Define the LevelSummary interface
export interface LevelSummary {
  id: string;
  name: string;
  type: string;
  levels: {
    id: string;
    name: string;
    active: number;
    inactive: number;
    normal: number;
    warnings: number;
    critical: number;
  }[];
  alerts: {
    level_id: string;
    level_name: string;
    sensors: {
      severity: string;
      value: number;
    }[];
  }[];
  widget_url: string;
}

/**
 * Retrieves the levels data from the JSON file
 */
export async function getLevelsData(): Promise<LevelsData> {
  try {
    // Read the data from the JSON file
    const filePath = path.join(process.cwd(), "resources", "db.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents) as LevelsData;

    return data;
  } catch (error) {
    console.error("Error loading levels data:", error);
    // Return empty levels array if there's an error
    return { levels: [] };
  }
}
