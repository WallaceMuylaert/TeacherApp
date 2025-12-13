from backend.core import database, security
from backend.models import users as user_models, classes, students, enrollments, attendance, payments
from sqlalchemy.orm import Session

def create_admin():
    db = database.SessionLocal()
    email = "admin@system.com"
    password = "admin"
    
    # Check if admin exists
    existing = db.query(user_models.User).filter(user_models.User.email == email).first()
    if existing:
        print("Admin user already exists.")
        return

    hashed_password = security.get_password_hash(password)
    admin_user = user_models.User(email=email, hashed_password=hashed_password, is_admin=True)
    db.add(admin_user)
    db.commit()
    print(f"Admin user created: {email} / {password}")

if __name__ == "__main__":
    # Ensure tables exist
    database.Base.metadata.create_all(bind=database.engine)
    create_admin()
