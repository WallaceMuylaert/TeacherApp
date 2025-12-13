from backend.core import database, security
from backend.models import users as user_models
from sqlalchemy.orm import Session

def create_teacher():
    db = database.SessionLocal()
    email = "teacher1@test.com"
    password = "123" # Simple password for testing
    
    # Check if exists and delete
    existing = db.query(user_models.User).filter(user_models.User.email == email).first()
    if existing:
        db.delete(existing)
        db.commit()
        print(f"Deleted existing user {email}")

    hashed_password = security.get_password_hash(password)
    # is_admin defaults to False, so this is a teacher
    user = user_models.User(email=email, hashed_password=hashed_password, is_admin=False) 
    db.add(user)
    db.commit()
    print(f"Teacher created: {email} / {password}")

if __name__ == "__main__":
    create_teacher()
