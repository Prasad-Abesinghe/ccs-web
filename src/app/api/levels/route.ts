import { NextResponse } from "next/server";
import { env } from "~/env";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth-options";
import { type Level } from "~/lib/utils";

interface LevelsResponse {
  levels: Level[];
}

export async function GET() {
  try {
    // Use getServerSession for server-side API routes
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Otherwise, fetch from the backend API
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/levels`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch levels: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch levels: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as LevelsResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching levels data:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch levels data";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
