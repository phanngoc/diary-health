import { getToken } from "next-auth/jwt";
import { type NextRequest } from 'next/server';

/**
 * Fetches medications from the backend API
 * @param {object} token - The authentication token
 * @returns {Promise<Array>} - Promise resolving to array of medications
 */
async function fetchMedicationLogs(token) {

    console.log("Fetching medication logs...", token);
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medication-logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
}

export async function GET(request: NextRequest) {
    console.log("Fetching medication logs : start");
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // Fetch medications from the database or external API
    const medicationLogs = await fetchMedicationLogs(token);

    if (medicationLogs.status !== 200) {
      // Return a 401 error for the client to handle
      return new Response(JSON.stringify({ error: "Token expired" }), { status: 401 });
    }
    const medicationLogsData = await medicationLogs.json();

    return new Response(JSON.stringify(medicationLogsData), { status: 200 });
}

