from typing import List, Optional
from sqlmodel import Session, select
from ..models.medication_log import MedicationLog, MedicationLogCreate, MedicationLogUpdate, MedicationLogMedication
from ..models.medication import Medication
from ..config.database import get_session
from datetime import datetime

class MedicationLogService:
    def __init__(self, session: Session = next(get_session())):
        self.session = session

    async def get_medication_logs(self, user_id: int) -> List[MedicationLog]:
        statement = select(MedicationLog).where(MedicationLog.user_id == user_id)
        return self.session.exec(statement).all()

    async def get_medication_log(self, log_id: int, user_id: int) -> Optional[MedicationLog]:
        statement = select(MedicationLog).where(
            MedicationLog.id == log_id,
            MedicationLog.user_id == user_id
        )
        return self.session.exec(statement).first()

    async def create_medication_log(self, log: MedicationLogCreate, user_id: int) -> MedicationLog:
        # Create the medication log
        log_data = log.model_dump(exclude={"medication_ids"})
        db_log = MedicationLog(**log_data, user_id=user_id)
        self.session.add(db_log)
        self.session.commit()
        self.session.refresh(db_log)
        
        # Create medication relationships
        for medication_id in log.medication_ids:
            medication_relation = MedicationLogMedication(
                medication_log_id=db_log.id,
                medication_id=medication_id
            )
            self.session.add(medication_relation)
        
        self.session.commit()
        self.session.refresh(db_log)
        return db_log

    async def update_medication_log(self, log_id: int, log: MedicationLogUpdate, user_id: int) -> Optional[MedicationLog]:
        db_log = await self.get_medication_log(log_id, user_id)
        if not db_log:
            return None
        
        # Update basic fields
        log_data = log.model_dump(exclude_unset=True, exclude={"medication_ids"})
        for key, value in log_data.items():
            setattr(db_log, key, value)
        
        # Update updated_at timestamp
        db_log.updated_at = datetime.utcnow()
        
        # Update medication relationships if provided
        if log.medication_ids is not None:
            # Remove existing relationships
            existing_relations = self.session.exec(
                select(MedicationLogMedication).where(
                    MedicationLogMedication.medication_log_id == log_id
                )
            ).all()
            for relation in existing_relations:
                self.session.delete(relation)
            
            # Add new relationships
            for medication_id in log.medication_ids:
                medication_relation = MedicationLogMedication(
                    medication_log_id=log_id,
                    medication_id=medication_id
                )
                self.session.add(medication_relation)
        
        self.session.add(db_log)
        self.session.commit()
        self.session.refresh(db_log)
        return db_log

    async def delete_medication_log(self, log_id: int, user_id: int) -> bool:
        db_log = await self.get_medication_log(log_id, user_id)
        if not db_log:
            return False
        
        # Delete medication relationships first
        existing_relations = self.session.exec(
            select(MedicationLogMedication).where(
                MedicationLogMedication.medication_log_id == log_id
            )
        ).all()
        for relation in existing_relations:
            self.session.delete(relation)
        
        # Delete the medication log
        self.session.delete(db_log)
        self.session.commit()
        return True 