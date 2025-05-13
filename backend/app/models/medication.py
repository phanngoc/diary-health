from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .medication_log import MedicationLogMedication

class MedicationBase(SQLModel):
    name: str
    dosage: str
    frequency: str
    notes: Optional[str] = None

class Medication(MedicationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    logs: List["MedicationLog"] = Relationship(
        back_populates="medications",
        link_model=MedicationLogMedication
    )

class MedicationCreate(MedicationBase):
    pass

class MedicationRead(MedicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

class MedicationUpdate(SQLModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None 