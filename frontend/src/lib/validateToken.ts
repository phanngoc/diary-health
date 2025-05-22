/**
 * Validates a JWT token using Next.js Auth session endpoint
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    console.log("Validating token:", token);
    // Use Next.js Auth's session endpoint to validate the token
    const response = await fetch(`/api/auth/session`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
      },
    });
    console.log("Token validation response:", response);
    if (!(response.status === 200)) {
      return false;
    }

    const data = await response.json();
    return !!data.user; // If we have a user object, the token is valid
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};