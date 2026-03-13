from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from middleware import get_current_user
from models.debt import PlanRequest
from services.debt_planner import (
    calculate_avalanche_plan,
    calculate_cashflow_plan,
    calculate_snowball_plan,
    round_plan_for_currency,
)
from services.gemini_service import explain_repayment_plan

router = APIRouter(tags=["plan"])

STRATEGY_MAP = {
    "snowball": calculate_snowball_plan,
    "avalanche": calculate_avalanche_plan,
    "cashflow": calculate_cashflow_plan,
}


@router.post("/plan")
def create_plan(
    body: PlanRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    conn = db
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM debts WHERE user_id = %s", (user["id"],))
        debts = cur.fetchall() or []

    if not debts:
        raise HTTPException(status_code=400, detail="No debts found to plan")

    calculate_fn = STRATEGY_MAP[body.strategy]
    plan = calculate_fn(debts, extra_monthly=50)
    plan = round_plan_for_currency(plan, body.currency)

    try:
        explanation = explain_repayment_plan(plan)
        plan["explanation"] = explanation
    except Exception:
        plan["explanation"] = "AI explanation temporarily unavailable. Please try again later."

    return plan
