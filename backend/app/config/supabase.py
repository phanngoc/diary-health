from supabase import create_client, Client
import os

def get_supabase_client() -> Client:
    """Create and return a Supabase client."""
    return create_client(
        os.getenv("SUPABASE_URL", "http://localhost:54321"),
        os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0")
    ) 