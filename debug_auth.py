from sqlalchemy.orm import Session
from backend.core import database, security
from backend.crud import users as user_crud
from backend.models import users as user_models
from backend.models import classes, students, enrollments, attendance # Import all models

def debug_login(email: str, password: str):
    db: Session = database.SessionLocal()
    try:
        print(f"Checking user: {email}")
        user = user_crud.get_user_by_email(db, email=email)
        
        if not user:
            print("❌ User not found in database.")
            # List all users to see what's there
            all_users = db.query(user_models.User).all()
            print(f"Total users in DB: {len(all_users)}")
            for u in all_users:
                print(f" - {u.email} (Admin: {u.is_admin})")
            return

        print(f"✅ User found: {user.email} (ID: {user.id})")
        print(f"Hashed password in DB: {user.hashed_password}")
        
        is_valid = security.verify_password(password, user.hashed_password)
        if is_valid:
            print("✅ Password verification SUCCESS")
        else:
            print("❌ Password verification FAILED")
            print(f"Provided password: {password}")
            
    finally:
        db.close()

if __name__ == "__main__":
    # Test with existing admin
    debug_login("admin@system.com", "admin")
