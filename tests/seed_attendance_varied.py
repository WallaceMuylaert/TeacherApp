import random
from datetime import date, timedelta
from backend.core import database
from backend.models import users as user_models, students, classes, enrollments, attendance, payments

def seed_varied_attendance():
    db = database.SessionLocal()
    email = "yana@redacao.com"
    
    # 1. Get User
    user = db.query(user_models.User).filter(user_models.User.email == email).first()
    if not user:
        print(f"User {email} not found. Please run seed_yana.py first.")
        return

    print(f"Found user: {user.email} (ID: {user.id})")

    # 2. Get or Create Class
    class_name = "Turma Seed Varied"
    course_class = db.query(classes.Class).filter(
        classes.Class.owner_id == user.id,
        classes.Class.name == class_name
    ).first()

    if not course_class:
        print(f"Creating class '{class_name}'...")
        course_class = classes.Class(name=class_name, owner_id=user.id, schedule="Segunda 19:00")
        db.add(course_class)
        db.commit()
        db.refresh(course_class)
    else:
        print(f"Class '{class_name}' already exists (ID: {course_class.id}).")

    # 3. Get Students and Enroll
    my_students = db.query(students.Student).filter(students.Student.owner_id == user.id).limit(20).all()
    if not my_students:
        print("No students found. Run seed_yana.py first.")
        return

    print(f"Enrolling {len(my_students)} students...")
    for student in my_students:
        # Check if enrolled
        exists = db.query(enrollments.Enrollment).filter(
            enrollments.Enrollment.student_id == student.id,
            enrollments.Enrollment.class_id == course_class.id
        ).first()
        
        if not exists:
            enrollment = enrollments.Enrollment(student_id=student.id, class_id=course_class.id)
            db.add(enrollment)
    
    db.commit()

    # 4. Generate Varied Attendance (Last 14 days)
    print("Generating attendance sessions...")
    today = date.today()
    
    # Create 5 sessions in the last 20 days
    dates_to_seed = [today - timedelta(days=x*3) for x in range(6)] # Today, -3, -6, -9, -12, -15 days

    for session_date in dates_to_seed:
        # Check if session exists
        session = db.query(attendance.AttendanceSession).filter(
            attendance.AttendanceSession.class_id == course_class.id,
            attendance.AttendanceSession.date == session_date
        ).first()

        if not session:
            print(f"Creating session for {session_date}...")
            session = attendance.AttendanceSession(
                class_id=course_class.id,
                date=session_date,
                description=f"Aula do dia {session_date.strftime('%d/%m')}",
                lesson_number=1
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        
        # Add Logs
        for student in my_students:
            log_exists = db.query(attendance.AttendanceLog).filter(
                attendance.AttendanceLog.session_id == session.id,
                attendance.AttendanceLog.student_id == student.id
            ).first()

            if not log_exists:
                is_present = random.random() > 0.2 # 80% presence
                status = "present" if is_present else "absent"
                grade = None
                if is_present:
                     # Grade between 600 and 1000, varied
                    grade = random.randint(60, 100) * 10
                
                log = attendance.AttendanceLog(
                    session_id=session.id,
                    student_id=student.id,
                    status=status,
                    grade=grade,
                    essay_delivered=is_present and (random.random() > 0.1) # 90% delivered if present
                )
                db.add(log)
        
        db.commit()

    print("Success! Varied attendance data inserted.")

if __name__ == "__main__":
    seed_varied_attendance()
