from .medication import Medication, MedicationCreate, MedicationRead, MedicationUpdate
from .medication_log import MedicationLog, MedicationLogCreate, MedicationLogRead, MedicationLogUpdate

__all__ = [
    "Medication",
    "MedicationCreate",
    "MedicationRead",
    "MedicationUpdate",
    "MedicationLog",
    "MedicationLogCreate",
    "MedicationLogRead",
    "MedicationLogUpdate"
]

# First rebuild base models to ensure they're fully defined
Medication.model_rebuild()
MedicationLog.model_rebuild()

# Then rebuild models with nested relationships
MedicationRead.model_rebuild()
MedicationLogRead.model_rebuild()