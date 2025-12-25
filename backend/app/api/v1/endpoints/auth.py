from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.user_service import create_user, authenticate_user
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    user = create_user(db, payload.name, payload.email, payload.password, role="user")
    return {"message": "Signup successful", "user_id": user.id}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    token = create_access_token(subject=user.email, role=user.role)
    return TokenResponse(access_token=token, role=user.role)
