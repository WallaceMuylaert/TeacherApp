from backend.core import database, security
from backend.core import database, security
from backend.models import users as user_models, students, classes, enrollments, attendance, payments
import random

def seed_data():
    db = database.SessionLocal()
    email = "yana@redacao.com"
    password = "123456"
    
    # 1. Get or Create User
    user = db.query(user_models.User).filter(user_models.User.email == email).first()
    if not user:
        print(f"Creating user {email}...")
        hashed_password = security.get_password_hash(password)
        user = user_models.User(email=email, hashed_password=hashed_password, is_admin=False) # specific user, maybe not admin
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User created with ID: {user.id}")
    else:
        print(f"User {email} already exists with ID: {user.id}")

    # 2. Create 20 Students
    print("Seeding 20 students...")
    first_names = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Julia"]
    last_names = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"]

    for i in range(20):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        full_name = f"{fname} {lname} {i+1}" # Add number to ensure uniqueness/variety
        
        student = students.Student(
            name=full_name,
            phone=f"1199999{i:04d}",
            parent_name=f"Parent of {fname}",
            parent_phone=f"1198888{i:04d}",
            parent_email=f"parent{i}@example.com",
            owner_id=user.id
        )
        db.add(student)
    
    db.commit()
    print("Successfully added 20 students.")

if __name__ == "__main__":
    seed_data()
