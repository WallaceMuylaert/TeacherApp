from pydantic import BaseModel
from typing import Optional
from datetime import date

class PaymentBase(BaseModel):
    student_id: int
    month: int
    year: int
    status: str = "PENDING"
    amount: float
    paid_at: Optional[date] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    student: Optional['StudentBase'] = None # To display student name if needed

    class Config:
        from_attributes = True

# Forward ref resolving
from backend.schemas.students import StudentBase
Payment.model_rebuild()
