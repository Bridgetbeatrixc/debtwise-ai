from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from middleware import get_current_user
from models.debt import SimulationRequest
from services.debt_planner import simulate_payment

router = APIRouter(tags=["simulation"])


@router.post("/simulate")
def simulate(body: SimulationRequest, user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM debts WHERE user_id = %s", (user["id"],))
        debts = cur.fetchall() or []

    if not debts:
        raise HTTPException(status_code=400, detail="No debts found to simulate")

    result = simulate_payment(debts, body.extra_monthly_payment)
    return result
