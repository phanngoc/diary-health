from sqlmodel import Session
from app.config.database import get_session
from app.seeds.user_seeder import seed_users

def run_seeders():
    """
    Run all database seeders
    """
    session = next(get_session())
    
    try:
        # Add all seeders here
        seed_users(session)
        
        print("All seeders completed successfully!")
        
    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        
    finally:
        session.close()

if __name__ == "__main__":
    run_seeders()
