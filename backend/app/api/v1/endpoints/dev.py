from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.user_service import create_user

router = APIRouter(prefix="/dev", tags=["dev"])

@router.post("/create-admin")
def create_admin(db: Session = Depends(get_db)):
    admin_email = "admin@example.com"
    admin_password = "Admin@12345"
    admin_name = "Admin"

    user = create_user(db, admin_name, admin_email, admin_password, role="admin")
    return {"message": "Admin created", "email": user.email, "password": admin_password}
