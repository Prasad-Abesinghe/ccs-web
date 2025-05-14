"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { type SensorData } from "./sensor-card";

interface SensorSummaryProps {
  sensor: SensorData;
}

export function SensorSummary({ sensor }: SensorSummaryProps) {
  const widgetUrl = sensor.widget_url;

  return (
    <div className="space-y-4">
      {widgetUrl && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sensor Data</CardTitle>
          </CardHeader>
          <CardContent
            className="space-y-4 pt-0"
            style={{
              backgroundColor: "rgb(17, 18, 23)",
              borderRadius: "0 0 0.75rem 0.75rem",
            }}
          >
            <iframe
              id="iframe"
              src={widgetUrl}
              className="h-[600px] w-full"
              frameBorder="0"
              onError={(e) => {
                console.error("Iframe loading error:", e);
                // In case of error, set a fallback display
                const iframe = e.currentTarget as HTMLIFrameElement;
                iframe.srcdoc = `<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#999;">
                  <p>Unable to load Grafana widget. Please try again later.</p>
                </div>`;
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
