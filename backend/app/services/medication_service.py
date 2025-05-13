from typing import List, Optional
from sqlmodel import Session, select
from ..models.medication import Medication, MedicationCreate, MedicationUpdate
from ..config.database import get_session

class MedicationService:
    def __init__(self, session: Session = next(get_session())):
        self.session = session

    async def get_medications(self, user_id: int) -> List[Medication]:
        statement = select(Medication).where(Medication.user_id == user_id)
        return self.session.exec(statement).all()

    async def get_medication(self, medication_id: int, user_id: int) -> Optional[Medication]:
        statement = select(Medication).where(
            Medication.id == medication_id,
            Medication.user_id == user_id
        )
        return self.session.exec(statement).first()

    async def create_medication(self, medication: MedicationCreate, user_id: int) -> Medication:
        db_medication = Medication.model_validate(medication)
        db_medication.user_id = user_id
        self.session.add(db_medication)
        self.session.commit()
        self.session.refresh(db_medication)
        return db_medication

    async def update_medication(self, medication_id: int, medication: MedicationUpdate, user_id: int) -> Optional[Medication]:
        db_medication = await self.get_medication(medication_id, user_id)
        if not db_medication:
            return None
        
        medication_data = medication.model_dump(exclude_unset=True)
        for key, value in medication_data.items():
            setattr(db_medication, key, value)
        
        self.session.add(db_medication)
        self.session.commit()
        self.session.refresh(db_medication)
        return db_medication

    async def delete_medication(self, medication_id: int, user_id: int) -> bool:
        db_medication = await self.get_medication(medication_id, user_id)
        if not db_medication:
            return False
        
        self.session.delete(db_medication)
        self.session.commit()
        return True 