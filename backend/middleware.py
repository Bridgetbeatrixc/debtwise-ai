from fastapi import Request, HTTPException
from database import get_supabase


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ")[1]
    sb = get_supabase()

    try:
        user_response = sb.auth.get_user(token)
        if user_response is None or user_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "id": str(user_response.user.id),
            "email": user_response.user.email,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
