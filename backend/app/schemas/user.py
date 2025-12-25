from pydantic import BaseModel, EmailStr

class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: str | None = None
