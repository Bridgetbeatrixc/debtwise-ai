from fastapi import APIRouter, Depends
from middleware import get_current_user
from database import get_supabase
from services.insight_engine import generate_insight_for_user

router = APIRouter(tags=["insights"])


@router.get("/insights")
async def get_insights(user: dict = Depends(get_current_user)):
    sb = get_supabase()

    response = (
        sb.table("monthly_insights")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(12)
        .execute()
    )

    return response.data


@router.post("/insights/generate")
async def generate_insights(user: dict = Depends(get_current_user)):
    summary = await generate_insight_for_user(user["id"])
    return {"summary": summary}
