from backend.models import users as user_models
from backend.models import classes as class_models
from backend.models import students as student_models
from backend.models import enrollments as enrollment_models
from backend.models import attendance as attendance_models

from backend.schemas import auth as auth_schemas
from backend.schemas import users as user_schemas
from backend.schemas import classes as class_schemas
from backend.schemas import students as student_schemas
from backend.schemas import attendance as attendance_schemas

from backend.crud import users as user_crud
from backend.crud import classes as class_crud
from backend.crud import students as student_crud
from backend.crud import enrollments as enrollment_crud
from backend.crud import attendance as attendance_crud

from backend.routers import auth, users, classes, students, attendance as attendance_router

def test_models_imports():
    assert hasattr(user_models, "User")
    assert hasattr(class_models, "Class")
    assert hasattr(student_models, "Student")
    assert hasattr(enrollment_models, "Enrollment")
    assert hasattr(attendance_models, "AttendanceSession")
    assert hasattr(attendance_models, "AttendanceLog")

def test_schemas_imports():
    assert hasattr(auth_schemas, "Token")
    assert hasattr(user_schemas, "User")
    assert hasattr(class_schemas, "Class")
    assert hasattr(student_schemas, "Student")
    assert hasattr(attendance_schemas, "AttendanceSession")

def test_crud_imports():
    assert hasattr(user_crud, "get_user_by_email")
    assert hasattr(class_crud, "get_classes")
    assert hasattr(student_crud, "get_students")
    assert hasattr(enrollment_crud, "enroll_student")
    assert hasattr(attendance_crud, "get_attendance_session")

def test_routers_imports():
    assert hasattr(auth, "router")
    assert hasattr(users, "router")
    assert hasattr(classes, "router")
    assert hasattr(students, "router")
    assert hasattr(attendance_router, "router")
