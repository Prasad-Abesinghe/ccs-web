// Sensor interface
export interface Sensor {
  id: string;
  sensor_type: string | null;
  sub_type: string | null;
  configuration: Record<string, unknown>;
  node: string;
  thresholds: {
    warning: string | number;
    critical: string | number;
  };
  status: 'Active' | 'Inactive';
  last_updated: string | null;
}

// Sensor Report interfaces
export interface SensorReport {
  sensor_id: string;
  name: string;
  location: string;
  value: number;
  type: string;
  last_updated: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface SensorReportPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface SensorReportResponse {
  data: SensorReport[];
  pagination: SensorReportPagination;
}

export interface SensorReportFilterParams {
  limit?: number;
  value?: number;
  operator?: 'greater' | 'less' | 'equal';
  fromDate?: string;
  toDate?: string;
  aggregation?: 'max' | 'min' | 'avg';
  location?: string;
  cursor?: string;
}

// Export job response
export interface GenerateReportResponse {
  message: string;
  success?: boolean;
  jobId?: string;
}

// API Responses
export interface SensorsResponse {
  status: string;
  message: string;
  data: Sensor[];
}

export interface SensorResponse {
  data: Sensor;
}

// Update sensor input
export interface UpdateSensorInput {
  sensor_type: string | null;
  sub_type: string | null;
  configuration: {
    section_name?: string;
    unit_id?: string;
    unit_sub_id?: string;
    vehicle_no?: string;
    location_index?: string;
    department?: string;
    [key: string]: unknown;
  };
  node: string;
  thresholds: {
    warning: number | string;
    critical: number | string;
  };
}

// Configuration field types based on sensor types
export interface SensorTypeConfig {
  value: string;
  label: string;
  subTypes?: SensorSubTypeConfig[];
  fields?: string[];
}

export interface SensorSubTypeConfig {
  value: string;
  label: string;
  fields: string[];
}

// Predefined sensor types
export const SENSOR_TYPES: SensorTypeConfig[] = [
  {
    value: "Temperature",
    label: "Temperature",
    subTypes: [
      {
        value: "wialon",
        label: "Wialon",
        fields: ["section_name", "vehicle_no", "unit_id", "location_index"]
      },
      {
        value: "teltonika",
        label: "Teltonika",
        fields: ["section_name", "unit_id", "location_index"]
      },
      {
        value: "lorawan_4G",
        label: "LoRaWAN 4G",
        fields: ["section_name", "unit_id", "unit_sub_id"]
      }
    ]
  },
  {
    value: "Decibel",
    label: "Decibel",
    fields: ["section_name", "department", "unit_id"]
  }
]; 
