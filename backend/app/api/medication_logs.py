from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.models.medication_log import MedicationLog, MedicationLogCreate, MedicationLogRead, MedicationLogUpdate
from app.models.medication import Medication
from app.utils.database import get_session
from app.services.medication_log_service import MedicationLogService
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/medication-logs", tags=["medication-logs"])
medication_log_service = MedicationLogService()


@router.post("/", response_model=MedicationLogRead, status_code=status.HTTP_201_CREATED)
def create_medication_log(
    medication_log: MedicationLogCreate,
    current_user: dict = Depends(get_current_user),
):
    # Verify the medication belongs to the user
    medication = session.get(Medication, medication_log.medication_id)
    if not medication or medication.user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    db_medication_log = MedicationLog.from_orm(medication_log, update={"user_id": current_user["id"]})
    session.add(db_medication_log)
    session.commit()
    session.refresh(db_medication_log)
    return db_medication_log


@router.get("/", response_model=List[MedicationLogRead])
async def get_medication_logs(current_user: dict = Depends(get_current_user)):
    return await medication_log_service.get_medication_logs(current_user["id"])


@router.get("/{log_id}", response_model=MedicationLogRead)
async def get_medication_log(log_id: int, current_user: dict = Depends(get_current_user)):
    log = await medication_log_service.get_medication_log(log_id)
    if not log or log.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Medication log not found")
    return log


@router.put("/{log_id}", response_model=MedicationLogRead)
async def update_medication_log(
    log_id: int,
    log: MedicationLogCreate,
    current_user: dict = Depends(get_current_user)
):
    existing = await medication_log_service.get_medication_log(log_id)
    if not existing or existing.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Medication log not found")
    return await medication_log_service.update_medication_log(log_id, log)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication_log(
    log_id: int,
    current_user: dict = Depends(get_current_user)
):
    existing = await medication_log_service.get_medication_log(log_id)
    if not existing or existing.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Medication log not found")
    success = await medication_log_service.delete_medication_log(log_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete medication log")
    return {"message": "Medication log deleted successfully"} 