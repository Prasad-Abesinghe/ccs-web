import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth-options";
import { type SensorResponse, type UpdateSensorInput } from "~/types/sensors";
import { env } from "~/env";

// Route segment config
export const dynamic = 'force-dynamic';

// GET handler for retrieving a single sensor
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (!id) {
      return NextResponse.json(
        { error: "Sensor ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/sensors/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to fetch sensor: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as SensorResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sensor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a sensor
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (!id) {
      return NextResponse.json(
        { error: "Sensor ID is required" },
        { status: 400 }
      );
    }

    // Parse request body with explicit validation
    const requestData = await req.json() as UpdateSensorInput;
    
    // Validate the request data has the expected shape
    // This is a basic check - consider using zod or another validation library for production
    if (
      typeof requestData !== 'object' || 
      requestData === null
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    const sensorData = requestData;

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/sensors/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sensorData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to update sensor: ${response.status}` },
        { status: response.status }
      );
    }

    // Instead of parsing the response, just return a success message
    return NextResponse.json({ 
      status: "success", 
      message: "Sensor updated successfully" 
    });
  } catch (error) {
    console.error('Error updating sensor:', error);
    return NextResponse.json(
      { error: 'Failed to update sensor' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a sensor
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (!id) {
      return NextResponse.json(
        { error: "Sensor ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/sensors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to delete sensor: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      status: "success", 
      message: "Sensor deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    return NextResponse.json(
      { error: 'Failed to delete sensor' },
      { status: 500 }
    );
  }
} 
