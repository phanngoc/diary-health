from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.services.ai_service import extract_medication_info
from app.utils.database import get_session
from app.models.medication import Medication, MedicationCreate
from app.models.medication_log import MedicationLog, MedicationLogCreate

router = APIRouter(prefix="/ai", tags=["ai"])


class MedicationNoteRequest(BaseModel):
    note: str


class MedicationNoteResponse(BaseModel):
    medication_name: str = None
    dosage: str = None
    frequency: str = None
    taken_at: str = None
    feeling_after: str = None
    saved: bool = False


@router.post("/analyze-note", response_model=MedicationNoteResponse)
async def analyze_medication_note(
    request: MedicationNoteRequest,
    user_id: str = "test_user",  # Temporary, will be replaced with real authentication
    session: Session = Depends(get_session),
):
    try:
        # Extract information from the note using AI
        extracted_info = await extract_medication_info(request.note)
        
        response = MedicationNoteResponse(
            medication_name=extracted_info.get("medication_name"),
            dosage=extracted_info.get("dosage"),
            frequency=extracted_info.get("frequency"),
            taken_at=extracted_info.get("taken_at"),
            feeling_after=extracted_info.get("feeling_after"),
            saved=False
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing note: {str(e)}")


@router.post("/analyze-and-save", response_model=MedicationNoteResponse)
async def analyze_and_save_medication(
    request: MedicationNoteRequest,
    user_id: str = "test_user",  # Temporary, will be replaced with real authentication
    session: Session = Depends(get_session),
):
    try:
        # Extract information from the note using AI
        extracted_info = await extract_medication_info(request.note)
        
        # Check if we have a medication name
        if not extracted_info.get("medication_name"):
            raise HTTPException(
                status_code=400, 
                detail="Could not extract medication name from the note"
            )
        
        # Create or update the medication
        medication_create = MedicationCreate(
            name=extracted_info.get("medication_name"),
            dosage=extracted_info.get("dosage"),
            frequency=extracted_info.get("frequency"),
            notes=request.note
        )
        
        # Save the medication
        db_medication = Medication.from_orm(medication_create, update={"user_id": user_id})
        session.add(db_medication)
        session.commit()
        session.refresh(db_medication)
        
        # Create a medication log entry
        medication_log_create = MedicationLogCreate(
            medication_id=db_medication.id,
            notes=request.note,
            feeling_after=extracted_info.get("feeling_after"),
        )
        
        # Save the medication log
        db_medication_log = MedicationLog.from_orm(medication_log_create, update={"user_id": user_id})
        session.add(db_medication_log)
        session.commit()
        
        response = MedicationNoteResponse(
            medication_name=extracted_info.get("medication_name"),
            dosage=extracted_info.get("dosage"),
            frequency=extracted_info.get("frequency"),
            taken_at=extracted_info.get("taken_at"),
            feeling_after=extracted_info.get("feeling_after"),
            saved=True
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving medication: {str(e)}") 