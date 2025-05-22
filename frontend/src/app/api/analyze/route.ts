import { getToken } from "next-auth/jwt";
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    console.log("Token", token);
    const payload = await request.json();
    console.log("Request body", payload);
    // Fetch medications from the database or external API
    const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-and-save`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });

    if (analyzeResponse.status !== 200) {
      // Return a 401 error for the client to handle
      return new Response(JSON.stringify({ error: "Token expired" }), { status: 401 });
    }
    const data = await analyzeResponse.json();

    return new Response(JSON.stringify(data), { status: 200 });
}

