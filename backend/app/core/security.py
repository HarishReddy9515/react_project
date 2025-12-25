import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings

ALGORITHM = "HS256"

def _pw_bytes(password: str) -> bytes:
    b = password.encode("utf-8")
    # bcrypt only accepts up to 72 bytes
    if len(b) > 72:
        raise ValueError("Password too long for bcrypt (max 72 bytes).")
    return b

def hash_password(password: str) -> str:
    pw = _pw_bytes(password)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw, salt).decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    pw = _pw_bytes(password)
    return bcrypt.checkpw(pw, password_hash.encode("utf-8"))

def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
