import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth-options";
import { type SensorsResponse, type UpdateSensorInput } from "~/types/sensors";
import { env } from "~/env";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/sensors`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to fetch sensors: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as SensorsResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const sensorData = await request.json() as UpdateSensorInput;

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/sensors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sensorData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to create sensor: ${response.status}` },
        { status: response.status }
      );
    }

    // Return success message
    return NextResponse.json({ 
      status: "success", 
      message: "Sensor created successfully" 
    });
  } catch (error) {
    console.error('Error creating sensor:', error);
    return NextResponse.json(
      { error: 'Failed to create sensor' },
      { status: 500 }
    );
  }
} 
