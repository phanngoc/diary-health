from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

# Import only the MedicationLogMedication class, not the whole module
from .medication_log import MedicationLogMedication

# Use TYPE_CHECKING to prevent circular imports
if TYPE_CHECKING:
    from .medication_log import MedicationLog

class MedicationBase(SQLModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None

class Medication(MedicationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
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
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime

class MedicationUpdate(SQLModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None 


Medication.model_rebuild()

