from fastapi import APIRouter
from app.api.medications import router as medications_router
from app.api.medication_logs import router as medication_logs_router
from app.api.ai import router as ai_router

router = APIRouter()

router.include_router(medications_router)
router.include_router(medication_logs_router)
router.include_router(ai_router) 