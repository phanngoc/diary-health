from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class MedicationLogBase(SQLModel):
    taken_at: datetime
    notes: str | None = None
    feeling_after: str | None = None


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
    medications: List["Medication"]


class MedicationLogUpdate(SQLModel):
    taken_at: datetime | None = None
    notes: str | None = None
    feeling_after: str | None = None
    medication_ids: List[int] | None = None 