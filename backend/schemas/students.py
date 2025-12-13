from pydantic import BaseModel
from typing import Optional

class StudentBase(BaseModel):
    name: str
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True
