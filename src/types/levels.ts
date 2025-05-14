// Base Level interface
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

// Node interface for API responses
export interface Node {
  id: string;
  name: string;
  description: string;
  parent_id?: string;
  type: string;
  level: number;
  has_sensor: boolean;
}

// New Level form data
export interface NewLevelFormData {
  name: string;
  description: string;
  parent_id?: string;
}

// Create Level API Response
export interface CreateLevelResponse {
  status: string;
  message: string;
  data: Node;
}

// Update Level API Response
export interface UpdateLevelResponse {
  status: string;
  message: string;
  data: Node;
}

// Delete Level API Response
export interface DeleteLevelResponse {
  status: string;
  message: string;
  data: {
    id: string;
  }
}

// Sensor data interface
export interface SensorData {
  sensor_id: string;
  sensor_type: string;
  sensor_value: null | string;
  widget_url: string;
  warning?: boolean;
}

// Level summary interface for dashboard
export interface LevelSummary {
  active: number;
  inactive: number;
  normal: number;
  warnings: number;
  critical: number;
}

// Detailed level summary (from API)
export interface DetailedLevelSummary {
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

// API Response types
export interface LevelsResponse {
  data: Level[];
}

export interface LevelSummaryResponse {
  data: DetailedLevelSummary;
} 
