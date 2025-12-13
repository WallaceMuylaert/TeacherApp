from sqlalchemy.orm import Session
from backend.models.payments import Payment
from backend.schemas.payments import PaymentCreate
from typing import List, Optional

def get_payments(db: Session, student_id: Optional[int] = None, year: Optional[int] = None, month: Optional[int] = None):
    query = db.query(Payment)
    if student_id:
        query = query.filter(Payment.student_id == student_id)
    if year:
        query = query.filter(Payment.year == year)
    if month:
        query = query.filter(Payment.month == month)
    return query.all()

def create_payment(db: Session, payment: PaymentCreate):
    db_payment = Payment(
        student_id=payment.student_id,
        month=payment.month,
        year=payment.year,
        status=payment.status,
        amount=payment.amount,
        paid_at=payment.paid_at
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_payment_status(db: Session, payment_id: int, status: str):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment:
        payment.status = status
        db.commit()
        db.refresh(payment)
    return payment
