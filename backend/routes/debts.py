from fastapi import APIRouter, HTTPException, Depends
from models.debt import DebtCreate, DebtUpdate, DebtResponse
from middleware import get_current_user
from database import get_supabase

router = APIRouter(prefix="/debts", tags=["debts"])


@router.get("")
async def get_debts(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    response = sb.table("debts").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return response.data


@router.post("", status_code=201)
async def create_debt(debt: DebtCreate, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    debt_data = debt.model_dump()
    debt_data["user_id"] = user["id"]
    debt_data["debt_type"] = debt_data["debt_type"].value
    if debt_data.get("due_date"):
        debt_data["due_date"] = debt_data["due_date"].isoformat()

    response = sb.table("debts").insert(debt_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create debt")
    return response.data[0]


@router.put("/{debt_id}")
async def update_debt(debt_id: str, debt: DebtUpdate, user: dict = Depends(get_current_user)):
    sb = get_supabase()

    existing = sb.table("debts").select("*").eq("id", debt_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Debt not found")

    update_data = debt.model_dump(exclude_unset=True)
    if "debt_type" in update_data and update_data["debt_type"] is not None:
        update_data["debt_type"] = update_data["debt_type"].value
    if "due_date" in update_data and update_data["due_date"] is not None:
        update_data["due_date"] = update_data["due_date"].isoformat()

    response = sb.table("debts").update(update_data).eq("id", debt_id).eq("user_id", user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update debt")
    return response.data[0]


@router.delete("/{debt_id}")
async def delete_debt(debt_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()

    existing = sb.table("debts").select("*").eq("id", debt_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Debt not found")

    sb.table("debts").delete().eq("id", debt_id).eq("user_id", user["id"]).execute()
    return {"message": "Debt deleted successfully"}
