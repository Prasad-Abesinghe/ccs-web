import { NextResponse } from "next/server";
import { env } from "~/env";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth-options";

interface LevelSummaryResponse {
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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Level ID is required" },
        { status: 400 }
      );
    }

    // Otherwise, use the backend API with auth
    // Use getServerSession instead of getSession for server-side API routes
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`Fetching level summary from backend API for level: ${id}`);
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/levels/${id}/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch level summary: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch level summary: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as LevelSummaryResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching level summary:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch level summary";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
