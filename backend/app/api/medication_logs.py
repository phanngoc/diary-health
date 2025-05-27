from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.models.medication_log import MedicationLog, MedicationLogCreate, MedicationLogRead, MedicationLogUpdate
from app.models.medication import Medication
from app.utils.database import get_session
from app.services.medication_log_service import MedicationLogService
from app.core.auth import get_current_user

router = APIRouter(prefix="/medication-logs", tags=["medication-logs"])
medication_log_service = MedicationLogService()


@router.post("/", response_model=MedicationLogRead, status_code=status.HTTP_201_CREATED)
async def create_medication_log(
    medication_log: MedicationLogCreate,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Verify all medications belong to the user
    for medication_id in medication_log.medication_ids:
        medication = session.get(Medication, medication_id)
        if not medication or medication.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medication with id {medication_id} not found"
            )
    
    return await medication_log_service.create_medication_log(medication_log, current_user.id)


@router.get("/", response_model=List[MedicationLogRead])
async def get_medication_logs(current_user: dict = Depends(get_current_user)):
    return await medication_log_service.get_medication_logs(current_user.id)


@router.get("/{log_id}", response_model=MedicationLogRead)
async def get_medication_log(log_id: int, current_user: dict = Depends(get_current_user)):
    print("get_medication_log", log_id, current_user.id)
    log = await medication_log_service.get_medication_log(log_id, current_user.id)
    print("log", log)
    if not log or log.user_id != current_user.id:
        print("not current user")
        raise HTTPException(status_code=404, detail="Medication log not found")
    return log


@router.put("/{log_id}", response_model=MedicationLogRead)
async def update_medication_log(
    log_id: int,
    log: MedicationLogUpdate,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    existing = await medication_log_service.get_medication_log(log_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail="Medication log not found")
    
    # Verify all medications belong to the user if medication_ids is provided
    if log.medication_ids is not None:
        for medication_id in log.medication_ids:
            medication = session.get(Medication, medication_id)
            if not medication or medication.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Medication with id {medication_id} not found"
                )
    
    return await medication_log_service.update_medication_log(log_id, log, current_user.id)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication_log(
    log_id: int,
    current_user: dict = Depends(get_current_user)
):
    existing = await medication_log_service.get_medication_log(log_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail="Medication log not found")
    success = await medication_log_service.delete_medication_log(log_id, current_user.id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete medication log")
    return {"message": "Medication log deleted successfully"} 