from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from passlib.context import CryptContext

from config import get_settings
from database import get_db
from models.user import UserCreate, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _create_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")


@router.post("/signup")
def signup(user: UserCreate, db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        password_hash = pwd_context.hash(user.password)
        cur.execute(
            """
            INSERT INTO users (email, password_hash)
            VALUES (%s, %s)
            RETURNING id, email, created_at
            """,
            (user.email, password_hash),
        )
        row = cur.fetchone()
        conn.commit()

    token = _create_access_token(str(row["id"]), row["email"])
    return {
        "message": "Account created successfully",
        "user": {
            "id": str(row["id"]),
            "email": row["email"],
            "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        },
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/login")
def login(user: UserLogin, db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = %s",
            (user.email,),
        )
        row = cur.fetchone()

    if not row or not pwd_context.verify(user.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = _create_access_token(str(row["id"]), row["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(row["id"]),
            "email": row["email"],
            "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        },
    }
