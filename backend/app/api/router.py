from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.leads import router as leads_router
from app.api.routes.assignments import router as assignments_router
from app.api.routes.calls import router as calls_router
from app.api.routes.recordings import router as recordings_router
from app.api.routes.transcripts import router as transcripts_router
from app.api.routes.followups import router as follow_ups_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.performance import router as performance_router
from app.api.routes.coaching import router as coaching_router
from app.api.routes.reports import router as reports_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(leads_router)
api_router.include_router(assignments_router)
api_router.include_router(calls_router)
api_router.include_router(recordings_router)
api_router.include_router(transcripts_router)
api_router.include_router(follow_ups_router)
api_router.include_router(alerts_router)
api_router.include_router(performance_router)
api_router.include_router(coaching_router)
api_router.include_router(reports_router)