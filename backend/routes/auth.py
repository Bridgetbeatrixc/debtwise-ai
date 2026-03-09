from fastapi import APIRouter, HTTPException
from models.user import UserCreate, UserLogin
from database import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(user: UserCreate):
    sb = get_supabase()
    try:
        response = sb.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
        if response.user is None:
            raise HTTPException(status_code=400, detail="Signup failed")
        return {
            "message": "Account created successfully",
            "user": {
                "id": str(response.user.id),
                "email": response.user.email,
            },
            "access_token": response.session.access_token if response.session else None,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(user: UserLogin):
    sb = get_supabase()
    try:
        response = sb.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": str(response.user.id),
                "email": response.user.email,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
