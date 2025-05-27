import { NextResponse } from 'next/server';
import { auth } from "@/auth";

// GET: Fetch a specific medication log by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: any }> }
) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    console.log('Fetching medication log with ID:', id);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medication-logs/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Response status:', response);
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail || 'Failed to fetch medication log' }, { status: response.status });
    }

    const data = await response.json();
    console.log('Fetched medication log data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching medication log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update an existing medication log
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Access params directly without await
    const { id } = await context.params;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medication-logs/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail || 'Failed to update medication log' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating medication log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a medication log
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medication-logs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail || 'Failed to delete medication log' }, { status: response.status });
    }

    // For successful delete operations, return a simple success message
    return NextResponse.json({ message: 'Medication log deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting medication log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}