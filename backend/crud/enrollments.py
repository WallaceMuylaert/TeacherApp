from sqlalchemy.orm import Session
from backend.models.students import Student
from backend.models.enrollments import Enrollment

def get_students_for_class(db: Session, class_id: int):
    return db.query(Student).join(Enrollment).filter(Enrollment.class_id == class_id).all()

def enroll_student(db: Session, class_id: int, student_id: int):
    db_enrollment = Enrollment(class_id=class_id, student_id=student_id)
    db.add(db_enrollment)
    db.commit()
    return db_enrollment
