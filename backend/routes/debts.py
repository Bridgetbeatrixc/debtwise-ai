from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from middleware import get_current_user
from models.debt import DebtCreate, DebtUpdate

router = APIRouter(prefix="/debts", tags=["debts"])


@router.get("")
def get_debts(user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM debts WHERE user_id = %s ORDER BY created_at DESC",
            (user["id"],),
        )
        rows = cur.fetchall()
    return rows


@router.post("", status_code=201)
def create_debt(debt: DebtCreate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    data = debt.model_dump()
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO debts (user_id, provider, balance, interest_rate, minimum_payment, due_date, debt_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                user["id"],
                data["provider"],
                data["balance"],
                data["interest_rate"],
                data["minimum_payment"],
                data["due_date"],
                data["debt_type"].value,
            ),
        )
        row = cur.fetchone()
        conn.commit()
    if not row:
        raise HTTPException(status_code=400, detail="Failed to create debt")
    return row


@router.put("/{debt_id}")
def update_debt(
    debt_id: str,
    debt: DebtUpdate,
    user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM debts WHERE id = %s AND user_id = %s",
            (debt_id, user["id"]),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Debt not found")

        update_data = debt.model_dump(exclude_unset=True)
        fields = []
        values = []
        if "provider" in update_data:
            fields.append("provider = %s")
            values.append(update_data["provider"])
        if "balance" in update_data:
            fields.append("balance = %s")
            values.append(update_data["balance"])
        if "interest_rate" in update_data:
            fields.append("interest_rate = %s")
            values.append(update_data["interest_rate"])
        if "minimum_payment" in update_data:
            fields.append("minimum_payment = %s")
            values.append(update_data["minimum_payment"])
        if "due_date" in update_data:
            fields.append("due_date = %s")
            values.append(update_data["due_date"])
        if "debt_type" in update_data and update_data["debt_type"] is not None:
            fields.append("debt_type = %s")
            values.append(update_data["debt_type"].value)

        if not fields:
            cur.execute(
                "SELECT * FROM debts WHERE id = %s AND user_id = %s",
                (debt_id, user["id"]),
            )
            return cur.fetchone()

        values.extend([debt_id, user["id"]])
        query = f"UPDATE debts SET {', '.join(fields)} WHERE id = %s AND user_id = %s RETURNING *"
        cur.execute(query, tuple(values))
        row = cur.fetchone()
        conn.commit()

    if not row:
        raise HTTPException(status_code=400, detail="Failed to update debt")
    return row


@router.delete("/{debt_id}")
def delete_debt(debt_id: str, user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM debts WHERE id = %s AND user_id = %s",
            (debt_id, user["id"]),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Debt not found")

        cur.execute("DELETE FROM debts WHERE id = %s AND user_id = %s", (debt_id, user["id"]))
        conn.commit()

    return {"message": "Debt deleted successfully"}
