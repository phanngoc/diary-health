from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

# Use TYPE_CHECKING to prevent circular imports
if TYPE_CHECKING:
    from .medication import Medication


class MedicationLogBase(SQLModel):
    taken_at: datetime
    notes: Optional[str] = None
    feeling_after: Optional[str] = None


class MedicationLogMedication(SQLModel, table=True):
    medication_log_id: Optional[int] = Field(
        default=None,
        foreign_key="medicationlog.id",
        primary_key=True
    )
    medication_id: Optional[int] = Field(
        default=None,
        foreign_key="medication.id",
        primary_key=True
    )


class MedicationLog(MedicationLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    medications: List["Medication"] = Relationship(
        back_populates="logs",
        link_model=MedicationLogMedication
    )


class MedicationLogCreate(MedicationLogBase):
    medication_ids: List[int]


class MedicationLogRead(MedicationLogBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    medications: List["Medication"] = []


class MedicationLogUpdate(SQLModel):
    taken_at: Optional[datetime] = None
    notes: Optional[str] = None
    feeling_after: Optional[str] = None
    medication_ids: Optional[List[int]] = None 