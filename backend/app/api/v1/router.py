from fastapi import APIRouter
from app.core.config import settings
from app.api.v1.endpoints import auth, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)

# Dev routes only in dev environment
if settings.ENV == "dev":
    from app.api.v1.endpoints import dev
    api_router.include_router(dev.router)
