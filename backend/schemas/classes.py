from pydantic import BaseModel
from typing import List
from backend.schemas.students import Student

class ClassBase(BaseModel):
    name: str
    schedule: str

class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: int
    owner_id: int

    # students: List[Student] = [] # Removed to avoid mismatch with ORM model which has 'enrollments'
    class Config:
        from_attributes = True
