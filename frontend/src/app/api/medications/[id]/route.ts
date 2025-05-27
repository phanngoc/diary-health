"use server";

import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8001";

async function fetchMedication(token: any, id: string) {
  try {
    const response = await fetch(`${API_URL}/api/medications/${id}`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch medication: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error("Error fetching medication:", error);
    throw error;
  }
}

async function updateMedication(token: any, id: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/api/medications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update medication: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("Fetching medication with ID:", params.id);
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  try {
    const medication = await fetchMedication(token, params.id);
    const medicationData = await medication.json();

    return new Response(JSON.stringify(medicationData), { status: 200 });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch medication" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("Updating medication with ID:", params.id);
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  try {
    const data = await request.json();
    const response = await updateMedication(token, params.id, data);
    const updatedMedication = await response.json();

    return new Response(JSON.stringify(updatedMedication), { status: 200 });
  } catch (error) {
    console.error("Error in PUT handler:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update medication" }),
      { status: 500 }
    );
  }
}