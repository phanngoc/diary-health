from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .medication import Medication


class MedicationLogBase(SQLModel):
    medication_id: int = Field(foreign_key="medication.id")
    taken_at: datetime
    notes: Optional[str] = None
    feeling_after: Optional[str] = None


class MedicationLog(MedicationLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="auth.users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    medication: "Medication" = Relationship(back_populates="logs")


class MedicationLogCreate(MedicationLogBase):
    pass


class MedicationLogRead(MedicationLogBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    medication: Medication


class MedicationLogUpdate(SQLModel):
    medication_id: Optional[int] = None
    taken_at: Optional[datetime] = None
    notes: Optional[str] = None
    feeling_after: Optional[str] = None 