from fastapi import APIRouter, Depends

from database import get_db
from middleware import get_current_user
from services.insight_engine import generate_insight_for_user

router = APIRouter(tags=["insights"])


@router.get("/insights")
def get_insights(user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT *
            FROM monthly_insights
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 12
            """,
            (user["id"],),
        )
        rows = cur.fetchall()

    return rows


@router.post("/insights/generate")
def generate_insights(user: dict = Depends(get_current_user)):
    try:
        summary = generate_insight_for_user(user["id"])
    except Exception as e:
        summary = f"AI insight generation temporarily unavailable ({type(e).__name__}). Please try again later."
    return {"summary": summary}
