from fastapi import APIRouter, Depends, HTTPException
from models.debt import PlanRequest
from middleware import get_current_user
from database import get_supabase
from services.debt_planner import (
    calculate_snowball_plan,
    calculate_avalanche_plan,
    calculate_cashflow_plan,
)
from services.openai_service import explain_repayment_plan

router = APIRouter(tags=["plan"])

STRATEGY_MAP = {
    "snowball": calculate_snowball_plan,
    "avalanche": calculate_avalanche_plan,
    "cashflow": calculate_cashflow_plan,
}


@router.post("/plan")
async def create_plan(body: PlanRequest, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    debts_resp = sb.table("debts").select("*").eq("user_id", user["id"]).execute()
    debts = debts_resp.data or []

    if not debts:
        raise HTTPException(status_code=400, detail="No debts found to plan")

    calculate_fn = STRATEGY_MAP[body.strategy]
    plan = calculate_fn(debts, extra_monthly=50)

    explanation = await explain_repayment_plan(plan)
    plan["explanation"] = explanation

    return plan
