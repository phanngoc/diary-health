from sqlmodel import Session, select
from app.models.user import User
import bcrypt  # Direct import of bcrypt

# Define our own password hashing function to avoid passlib issues
def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly."""
    # Generate a salt and hash the password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password.decode('utf-8')

def seed_users(session: Session):
    """
    Seed the database with initial users.
    
    Args:
        session: SQLModel Session
    """
    # Check if there are existing users to avoid duplicates
    statement = select(User)
    existing_users = session.exec(statement).all()
    
    if existing_users:
        print("Users already exist in the database. Skipping user seeding.")
        return
    
    # Define sample users
    users = [
        {
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "Admin User",
            "is_active": True
        },
        {
            "email": "user@example.com",
            "password": "userpassword",
            "full_name": "Test User",
            "is_active": True
        },
        {
            "email": "demo@example.com",
            "password": "demopassword",
            "full_name": "Demo User",
            "is_active": True
        }
    ]
    
    # Create user records
    for user_data in users:
        hashed_password = hash_password(user_data["password"])
        
        user = User(
            email=user_data["email"],
            hashed_password=hashed_password,
            full_name=user_data["full_name"],
            is_active=user_data["is_active"]
        )
        
        session.add(user)
    
    # Commit the changes
    session.commit()
    print(f"Successfully seeded {len(users)} users.")
