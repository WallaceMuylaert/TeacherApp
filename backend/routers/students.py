from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from docx import Document
from typing import List, Optional
import io
import pydantic
from backend.schemas import students as student_schemas
from backend.schemas import users as user_schemas
from backend.crud import students as student_crud
from backend.core import database, security

router = APIRouter()

@router.get("/students/", response_model=List[student_schemas.Student])
def read_students(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    db: Session = Depends(database.get_db), 
    current_user: user_schemas.User = Depends(security.get_current_user)
):
    return student_crud.get_students(db, user_id=current_user.id, skip=skip, limit=limit, search=search)

@router.post("/students/", response_model=student_schemas.Student)
def create_student(student: student_schemas.StudentCreate, db: Session = Depends(database.get_db), current_user: user_schemas.User = Depends(security.get_current_user)):
    return student_crud.create_student(db=db, student=student, user_id=current_user.id)

class StudentUpdate(pydantic.BaseModel):
    name: str

@router.put("/students/{student_id}")
def update_student(student_id: int, student_data: StudentUpdate, db: Session = Depends(database.get_db), current_user: user_schemas.User = Depends(security.get_current_user)):
    # Verify ownership logic could be added here (check student -> owner_id)
    student = student_crud.update_student(db, student_id=student_id, name=student_data.name)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(database.get_db), current_user: user_schemas.User = Depends(security.get_current_user)):
    student = student_crud.delete_student(db, student_id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"detail": "Student deleted"}

@router.get("/students/{student_id}/report/docx")
def generate_student_report(student_id: int, db: Session = Depends(database.get_db), current_user: user_schemas.User = Depends(security.get_current_user)):
    stats = student_crud.get_student_report_stats(db, student_id=student_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Student not found")
    
    document = Document()
    document.add_heading(f'Relatório do Aluno: {stats["student"].name}', 0)
    
    document.add_paragraph(f'Total de Aulas: {stats["total_classes"]}')
    document.add_paragraph(f'Aulas Presente: {stats["present"]}')
    document.add_paragraph(f'Taxa de Presença: {stats["attendance_rate"]}%')
    document.add_paragraph(f'Média de Notas: {stats["avg_grade"]}')
    
    document.add_heading('Histórico Detalhado', level=1)
    
    table = document.add_table(rows=1, cols=5)
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Data'
    hdr_cells[1].text = 'Descrição'
    hdr_cells[2].text = 'Status'
    hdr_cells[3].text = 'Nota'
    hdr_cells[4].text = 'Observação'
    
    for log in stats["logs"]:
        row_cells = table.add_row().cells
        # log.session might not be eager loaded if not careful, but CRUD joined?
        # CRUD logic just got logs. session info is in log.session relationship.
        # Need to ensure relationship is accessible. SQLAlchemy lazy loads by default so it should work if session active.
        row_cells[0].text = str(log.session.date)
        row_cells[1].text = str(log.session.description)
        row_cells[2].text = str(log.status)
        row_cells[3].text = str(log.grade) if log.grade is not None else '-'
        row_cells[4].text = str(log.observation) if log.observation else '-'
        
    # Save to memory
    file_stream = io.BytesIO()
    document.save(file_stream)
    file_stream.seek(0)
    
    return StreamingResponse(
        file_stream, 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=relatorio_{stats['student'].name}.docx"}
    )
