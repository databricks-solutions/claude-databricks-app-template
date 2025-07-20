# Generic router module for the Databricks app template
# Add your FastAPI routes here

from fastapi import APIRouter

from .user import router as user_router
from .traces import router as traces_router

router = APIRouter()
router.include_router(user_router, prefix='/user', tags=['user'])
router.include_router(traces_router, prefix='/traces', tags=['traces'])
