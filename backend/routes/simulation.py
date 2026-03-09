from fastapi import APIRouter, Depends, HTTPException
from models.debt import SimulationRequest
from middleware import get_current_user
from database import get_supabase
from services.debt_planner import simulate_payment

router = APIRouter(tags=["simulation"])


@router.post("/simulate")
async def simulate(body: SimulationRequest, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    debts_resp = sb.table("debts").select("*").eq("user_id", user["id"]).execute()
    debts = debts_resp.data or []

    if not debts:
        raise HTTPException(status_code=400, detail="No debts found to simulate")

    result = simulate_payment(debts, body.extra_monthly_payment)
    return result
