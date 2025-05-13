from typing import List, Optional
from sqlmodel import Session, select
from ..models.medication_log import MedicationLog, MedicationLogCreate, MedicationLogUpdate
from ..config.database import get_session

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
        db_log = MedicationLog.model_validate(log)
        db_log.user_id = user_id
        self.session.add(db_log)
        self.session.commit()
        self.session.refresh(db_log)
        return db_log

    async def update_medication_log(self, log_id: int, log: MedicationLogUpdate, user_id: int) -> Optional[MedicationLog]:
        db_log = await self.get_medication_log(log_id, user_id)
        if not db_log:
            return None
        
        log_data = log.model_dump(exclude_unset=True)
        for key, value in log_data.items():
            setattr(db_log, key, value)
        
        self.session.add(db_log)
        self.session.commit()
        self.session.refresh(db_log)
        return db_log

    async def delete_medication_log(self, log_id: int, user_id: int) -> bool:
        db_log = await self.get_medication_log(log_id, user_id)
        if not db_log:
            return False
        
        self.session.delete(db_log)
        self.session.commit()
        return True 