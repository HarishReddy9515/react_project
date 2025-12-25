from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_admin
from app.schemas.user import UserPublic, UserUpdate
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return user

@router.put("/me", response_model=UserPublic)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    if payload.name is not None:
        user.name = payload.name
    db.commit()
    db.refresh(user)
    return user
