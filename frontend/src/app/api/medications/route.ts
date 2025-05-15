import { getToken } from "next-auth/jwt";
import { type NextRequest } from 'next/server';

/**
 * Fetches medications from the backend API
 * @param {object} token - The authentication token
 * @returns {Promise<Array>} - Promise resolving to array of medications
 */
async function fetchMedications(token) {
  try {
    console.log("Fetching medications...", token);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();
    console.log("Response status:", responseData);

    return responseData;
  } catch (error) {
    console.error('Error fetching medications:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
    console.log("Fetching medications...");
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // Fetch medications from the database or external API
    const medications = await fetchMedications(token);

    return new Response(JSON.stringify(medications), { status: 200 });
}
