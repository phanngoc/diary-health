from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.models.medication import Medication, MedicationCreate, MedicationRead, MedicationUpdate
from app.utils.database import get_session
from app.services.medication_service import MedicationService
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/medications", tags=["medications"])
medication_service = MedicationService()


@router.post("/", response_model=MedicationRead, status_code=status.HTTP_201_CREATED)
def create_medication(
    medication: MedicationCreate,
    current_user: dict = Depends(get_current_user),
):
    return medication_service.create_medication(medication, current_user["id"])


@router.get("/", response_model=List[Medication])
async def get_medications(current_user: dict = Depends(get_current_user)):
    return await medication_service.get_medications(current_user["id"])


@router.get("/{medication_id}", response_model=Medication)
async def get_medication(medication_id: int, current_user: dict = Depends(get_current_user)):
    medication = await medication_service.get_medication(medication_id)
    if not medication or medication.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Medication not found")
    return medication


@router.put("/{medication_id}", response_model=Medication)
async def update_medication(
    medication_id: int,
    medication: MedicationCreate,
    current_user: dict = Depends(get_current_user)
):
    existing = await medication_service.get_medication(medication_id)
    if not existing or existing.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Medication not found")
    return await medication_service.update_medication(medication_id, medication)


@router.delete("/{medication_id}")
async def delete_medication(
    medication_id: int,
    current_user: dict = Depends(get_current_user)
):
    existing = await medication_service.get_medication(medication_id)
    if not existing or existing.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Medication not found")
    success = await medication_service.delete_medication(medication_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete medication")
    return {"message": "Medication deleted successfully"} 