from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from sqlmodel import Session

from app.services.ai_service import extract_medication_info
from app.utils.database import get_session
from app.models.medication import Medication, MedicationCreate
from app.models.medication_log import MedicationLog, MedicationLogCreate
from datetime import datetime, date

router = APIRouter(prefix="/ai", tags=["ai"])


class MedicationNoteRequest(BaseModel):
    note: Optional[str] = None
    image: Optional[str] = None  # Base64 encoded image


class MedicationNoteResponse(BaseModel):
    medication_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    taken_at: str | None = None
    feeling_after: str | None = None
    saved: bool = False


@router.post("/analyze-note", response_model=MedicationNoteResponse)
async def analyze_medication_note(
    request: MedicationNoteRequest,
    user_id: int = 1,  # Temporary, will be replaced with real authentication
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
    user_id: int = 1,  # Temporary, will be replaced with real authentication
    session: Session = Depends(get_session),
):
    print('analyze_and_save_medication', request.note, request.image)
    try:
        # Check if we have either note or image
        if not request.note and not request.image:
            raise HTTPException(
                status_code=400,
                detail="Either note or image must be provided"
            )
        
        # Extract information using AI
        if request.note:
            print('Processing text note')
            extracted_info = await extract_medication_info(note=request.note)
            notes_content = request.note
        else:
            print('Processing image data')
            extracted_info = await extract_medication_info(image_data=request.image)
            notes_content = "Image uploaded and analyzed by AI"
        
        print('extracted_info', extracted_info)
        
        # Check if we have a medication name
        if not extracted_info.get("medication_name"):
            raise HTTPException(
                status_code=400, 
                detail="Could not extract medication information from the input"
            )
        
        # Create or update the medication
        medication_create = MedicationCreate(
            name=extracted_info.get("medication_name"),
            dosage=extracted_info.get("dosage"),
            frequency=extracted_info.get("frequency"),
            notes=notes_content
        )
        
        # Save the medication
        db_medication = Medication.from_orm(medication_create, update={"user_id": user_id})
        session.add(db_medication)
        session.commit()
        session.refresh(db_medication)
        
        # Handle taken_at field - convert text like "today" to proper datetime
        taken_at = extracted_info.get("taken_at")
        if taken_at:
            if taken_at.lower() == "today":
                taken_at = datetime.now().date().isoformat()
            elif taken_at.lower() == "yesterday":
                taken_at = (datetime.now().date().replace(day=datetime.now().day-1)).isoformat()
        else:
            taken_at = datetime.now().date().isoformat()
            
        # Create a medication log entry
        medication_log_create = MedicationLogCreate(
            medication_ids=[db_medication.id],
            notes=notes_content,
            feeling_after=extracted_info.get("feeling_after"),
            taken_at=taken_at,  # Use the processed taken_at value instead of the raw value
        )
        
        # Save the medication log
        db_medication_log = MedicationLog.from_orm(medication_log_create, update={"user_id": user_id})
        session.add(db_medication_log)
        session.commit()
        
        response = MedicationNoteResponse(
            medication_name=extracted_info.get("medication_name"),
            dosage=extracted_info.get("dosage"),
            frequency=extracted_info.get("frequency"),
            taken_at=taken_at,  # Also use the processed taken_at here
            feeling_after=extracted_info.get("feeling_after"),
            saved=True
        )
        
        return response
    except HTTPException as e:
        print('HTTPException', e)
        raise e
    except Exception as e:
        print('Exception', e)
        raise HTTPException(status_code=500, detail=f"Error saving medication: {str(e)}")