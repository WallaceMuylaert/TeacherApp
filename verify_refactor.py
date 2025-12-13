import sys
import os
import traceback

# Add root to path
sys.path.append(os.getcwd())

# Mock environment variables needed for config
os.environ["SECRET_KEY"] = "verification_secret"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

print("Starting verification (Phase 2)...")

try:
    print("Attempting to import models (Direct)...")
    from backend.models.users import User
    from backend.models.classes import Class
    from backend.models.students import Student
    print("✅ Models imported successfully")
except ImportError as e:
    print(f"❌ Models import failed: {e}")
    sys.exit(1)

try:
    print("Attempting to import schemas (Direct)...")
    from backend.schemas.users import UserCreate
    from backend.schemas.students import StudentCreate
    from backend.schemas.classes import ClassCreate
    print("✅ Schemas imported successfully")
except ImportError as e:
    print(f"❌ Schemas import failed: {e}")
    sys.exit(1)

try:
    print("Attempting to import CRUD (Direct)...")
    from backend.crud.users import get_user_by_email
    from backend.crud.students import create_student
    from backend.crud.classes import get_classes
    print("✅ CRUD imported successfully")
except ImportError as e:
    print(f"❌ CRUD import failed: {e}")
    sys.exit(1)

try:
    print("Attempting to import routers (Direct)...")
    from backend.routers import auth, students, users, classes, attendance
    print("✅ Routers imported successfully")
except ImportError as e:
    print(f"❌ Routers import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

print("🎉 Verification complete! All modules imported correctly with direct paths.")
